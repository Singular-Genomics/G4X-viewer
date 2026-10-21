import {
  TranscriptTileLayerProps,
  TranscriptLayerProps,
  getTileDataProps,
  LayerDataItem
} from './transcript-layer.types';
import { CompositeLayer, GetPickingInfoParams, Layer, PickingInfo, UpdateParameters } from '@deck.gl/core';
import { PolygonLayer, TextLayer, ScatterplotLayer } from '@deck.gl/layers';
import { TileLayer } from '@deck.gl/geo-layers';
import type { _Tileset2D as Tileset2D } from '@deck.gl/geo-layers';
import type { Texture } from '@luma.gl/core';

import { LAYER_ZOOM_OFFSET } from '../../shared/constants';
import { ZarrTranscriptLoader } from './zarr-transcript-loader';
import { ColorMapEntry } from '../../stores/ZarrDataStore';
import { emptyTile } from '../../utils/transcriptTileDecode';
import { GeneRegistry } from '../../utils/GeneRegistry';
import {
  TileBucket,
  BucketEntry,
  TileSequencer,
  makeTileContent,
  updateBuckets,
  resolveBucketIndex,
  sameItems
} from './tile-buckets';
import { GeneLookupExtension, createGeneLookupTexture, fillGeneLookup } from './gene-lookup-extension';

// Reuse the parsed colormap while the colormap reference is unchanged (layer is rebuilt every render).
let parsedColorMapCache: { colormap: ColorMapEntry[]; parsed: Record<string, number[]> } | null = null;
const parseColorMap = (colormap: ColorMapEntry[]) => {
  if (parsedColorMapCache?.colormap !== colormap) {
    parsedColorMapCache = {
      colormap,
      parsed: Object.fromEntries(colormap.map((entry) => [entry.gene_name, entry.color]))
    };
  }
  return parsedColorMapCache.parsed;
};

const GENE_LOOKUP_EXTENSIONS = [new GeneLookupExtension()];

/**
 * Byte budget of deck's tile cache (typed arrays owned by cached tiles, see makeTileContent). A full-resolution full
 * view (~2,000 tiles) needs ~150 MB, so it fits with room for other levels. Tiles that are selected or visible are never
 * evicted, even if they alone exceed the budget; older invisible tiles go first.
 */
const TRANSCRIPT_TILE_CACHE_BYTES = 400 * 1024 * 1024;

const WHITE: [number, number, number] = [255, 255, 255];
const OUTLINE_COLOR: [number, number, number] = [238, 238, 238];
const BOUNDARY_COLOR: [number, number, number] = [255, 255, 255];
const LABEL_COLOR: [number, number, number, number] = [255, 255, 255, 255];
const LABEL_BACKGROUND: [number, number, number, number] = [0, 0, 0, 150];

type DebugLabel = { textLabel: string; position: [number, number] };

/**
 * TileLayer that keeps tile selection / fetching / caching / LOD, but instead of one sublayer per tile it draws the
 * visible tiles as a few "bucket" layers (consecutive runs of up to BUCKET_TILES tiles in the exact order the stock
 * TileLayer draws its per-tile sublayers: `tileset.tiles`, i.e. zoom ascending, then tile creation order).
 * Per-layer CPU cost in deck (uniform + buffer binding) dominates when ~2,000 tiles are on screen at once.
 *
 * A bucket's concatenated buffers are rebuilt only when its set of member tiles changes, never on pan/zoom alone.
 * renderLayers runs at most once per update pass (i.e. once per frame), so tile arrivals are batched per frame.
 */
class TranscriptTileLayer extends TileLayer<LayerDataItem[], TranscriptTileLayerProps> {
  initializeState() {
    super.initializeState();
    Object.assign(this.state, {
      buckets: new Map<string, TileBucket>(),
      sequencer: new TileSequencer<object>(),
      visibleItems: [] as LayerDataItem[],
      labels: null as { items: LayerDataItem[]; geneVisible: Uint8Array; version: number; data: DebugLabel[] } | null
    });
  }

  // The base getter requires every tile to own `tile.layers`, which this layer never creates.
  get isLoaded(): boolean {
    return Boolean(this.state?.tileset?.selectedTiles?.every((tile) => tile.isLoaded));
  }

  // Bucket sublayers span several tiles, so the per-tile viewport culling of TileLayer does not apply.
  filterSubLayer() {
    return true;
  }

  getPickingInfo({ info, sourceLayer }: GetPickingInfoParams): any {
    const bucket = (sourceLayer?.props as { bucket?: TileBucket } | undefined)?.bucket;
    if (bucket && info.index >= 0) {
      const hit = resolveBucketIndex(bucket, info.index);
      if (hit) {
        const i = info.index;
        info.object = {
          position: [bucket.positions[2 * i], bucket.positions[2 * i + 1]],
          geneName: this.props.geneNames[bucket.geneIndex[i]] ?? '',
          cellId: String(hit.item.points.cellId[hit.localIndex])
        };
      }
    }
    return info;
  }

  renderLayers() {
    const state = this.state as unknown as {
      tileset: Tileset2D | null;
      buckets: Map<string, TileBucket>;
      sequencer: TileSequencer<object>;
      visibleItems: LayerDataItem[];
      labels: { items: LayerDataItem[]; geneVisible: Uint8Array; version: number; data: DebugLabel[] } | null;
    };
    const tileset = state.tileset;
    if (!tileset) return null;

    // Same tiles, same order as the stock TileLayer draws: `tileset.tiles` (zoom ascending, then creation order),
    // restricted to tiles flagged visible by the refinement strategy ('never': selected tiles only). Every tile must
    // pass through the sequencer (loaded or not) so its sequence number reflects creation order, not load order.
    const entries: BucketEntry[] = [];
    let visible: LayerDataItem[] = [];
    for (const tile of tileset.tiles) {
      const key = state.sequencer.bucketKey(tile, tile.zoom);
      if (tile.isVisible && tile.content) {
        for (const item of tile.content as LayerDataItem[]) {
          entries.push({ item, key });
          visible.push(item);
        }
      }
    }
    if (sameItems(visible, state.visibleItems)) visible = state.visibleItems;
    else state.visibleItems = visible;

    const nextBuckets = updateBuckets(entries, state.buckets);
    state.buckets = nextBuckets;

    const layers: Layer[] = [];
    const {
      pointSize,
      showBoundries,
      showData,
      showDiscardedPoints,
      geneVisible,
      geneLookupTexture,
      geneLookupVersion
    } = this.props;

    if (showBoundries) {
      layers.push(
        new PolygonLayer(
          this.getSubLayerProps({
            id: 'boundaries',
            data: visible,
            filled: false,
            wireframe: false,
            getPolygon: (d: LayerDataItem) => d.boundingBox,
            getLineWidth: 5,
            lineWidthMaxPixels: 5,
            getLineColor: BOUNDARY_COLOR
          })
        )
      );
    }

    // @ INFO TEXT LAYER (number of points passing the filter is O(points): only recomputed when it can change)
    if (showData) {
      let labels = state.labels;
      if (
        !labels ||
        labels.items !== visible ||
        labels.geneVisible !== geneVisible ||
        labels.version !== geneLookupVersion
      ) {
        labels = {
          items: visible,
          geneVisible,
          version: geneLookupVersion,
          data: visible.map(({ index, textPosition, tileData, points }) => {
            let count = 0;
            for (let i = 0; i < points.length; i++) count += geneVisible[points.geneIndex[i]];
            return {
              textLabel: `[${index.x}, ${index.y}, ${index.z}]|[${tileData.width}, ${tileData.height}]|${count}`,
              position: [textPosition.y, textPosition.x]
            };
          })
        };
        state.labels = labels;
      }
      layers.push(
        new TextLayer(
          this.getSubLayerProps({
            id: 'labels',
            data: labels.data,
            getPosition: (d: DebugLabel) => d.position,
            getText: (d: DebugLabel) => d.textLabel,
            getTextAnchor: 'start',
            getAlignmentBaseline: 'top',
            getSize: 10,
            getColor: LABEL_COLOR,
            background: true,
            backgroundPadding: [5, 5],
            getBackgroundColor: LABEL_BACKGROUND
          })
        )
      );
    }

    if (!geneLookupTexture) return layers;

    // @ POINTS LAYERS
    // Both layers share the same binary attributes; the gene lookup texture decides, per point and on the GPU,
    // which of them draws it (and with what color). Filtering never rebuilds per-point data.
    for (const bucket of nextBuckets.values()) {
      if (showDiscardedPoints) {
        layers.push(
          new ScatterplotLayer(
            this.getSubLayerProps({
              id: `discarded-${bucket.key}`,
              data: bucket.data,
              getFillColor: WHITE,
              getLineColor: OUTLINE_COLOR,
              getLineWidth: 0.2,
              getRadius: pointSize,
              radiusUnits: 'pixels',
              updateTriggers: { getRadius: pointSize },
              filled: false,
              stroked: true,
              extensions: GENE_LOOKUP_EXTENSIONS,
              geneLookupTexture,
              geneLookupVersion,
              geneLookupMode: 'discarded'
            }) as any
          )
        );
      }
      layers.push(
        new ScatterplotLayer(
          this.getSubLayerProps({
            id: `points-${bucket.key}`,
            data: bucket.data,
            bucket,
            getFillColor: WHITE,
            getRadius: pointSize,
            radiusUnits: 'pixels',
            updateTriggers: { getRadius: pointSize },
            pickable: true,
            extensions: GENE_LOOKUP_EXTENSIONS,
            geneLookupTexture,
            geneLookupVersion,
            geneLookupMode: 'visible'
          }) as any
        )
      );
    }
    return layers;
  }
}

TranscriptTileLayer.layerName = 'TranscriptTileLayer';

const LOADING_IDLE_DELAY_MS = 200;
const NO_GENES: string[] = [];
const NO_VISIBLE = new Uint8Array(0);

class TranscriptLayer extends CompositeLayer<TranscriptLayerProps> {
  tileLoadCounter = 0;
  loadingIdleTimer: ReturnType<typeof setTimeout> | null = null;
  isReportedLoading = false;

  initializeState() {
    this.setState({
      loader: null,
      registry: null as GeneRegistry | null,
      lookupTexture: createGeneLookupTexture(this.context.device),
      lookupVersion: 0,
      geneVisible: NO_VISIBLE,
      lookupRegistryVersion: -1
    });
  }

  finalizeState() {
    if (this.loadingIdleTimer) clearTimeout(this.loadingIdleTimer);
    (this.state.lookupTexture as Texture | undefined)?.destroy();
  }

  updateState({ props, oldProps }: UpdateParameters<this>) {
    const sourceChanged =
      !this.state.loader ||
      props.zarrUrl !== oldProps.zarrUrl ||
      props.zarrStoreFactory !== oldProps.zarrStoreFactory ||
      props.config !== oldProps.config;

    if (sourceChanged) {
      const loader =
        props.zarrUrl || props.zarrStoreFactory
          ? new ZarrTranscriptLoader(props.zarrUrl ?? undefined, props.zarrStoreFactory)
          : null;
      this.setState({ loader: loader ?? false, registry: null, lookupRegistryVersion: -1 });
      loader?.ready.then((registry) => {
        if (this.state.loader !== loader) return;
        this.setState({ registry });
        (this.getCurrentLayer() as TranscriptLayer | null)?.refreshGeneLookup();
      });
    }

    if (sourceChanged || props.geneFilters !== oldProps.geneFilters || props.colormap !== oldProps.colormap) {
      this.refreshGeneLookup();
    }
  }

  /**
   * Rewrites the per-gene lookup (color + visible flag): O(genes), independent of the number of loaded points.
   * Uses the *current* layer instance's props because it may be called asynchronously after a re-render.
   */
  refreshGeneLookup() {
    const registry = this.state.registry as GeneRegistry | null;
    const texture = this.state.lookupTexture as Texture | undefined;
    if (!registry || !texture) return;
    const { geneFilters, colormap } = this.props;
    const colors = parseColorMap(colormap);
    const filter = geneFilters === 'all' ? null : geneFilters;
    const visibleFlags = new Uint8Array(registry.names.length);
    fillGeneLookup(texture, registry.names, colors, (name) => !filter || filter.has(name));
    for (let i = 0; i < registry.names.length; i++) {
      visibleFlags[i] = !filter || filter.has(registry.names[i]) ? 1 : 0;
    }
    this.setState({
      geneVisible: visibleFlags,
      lookupVersion: (this.state.lookupVersion as number) + 1,
      lookupRegistryVersion: registry.version
    });
    // setState already flags a redraw; setNeedsUpdate propagates the new lookup version to the tile sublayers.
    this.setNeedsUpdate();
  }

  updateLoadingState(delta: number) {
    this.tileLoadCounter = Math.max(this.tileLoadCounter + delta, 0);
    if (this.loadingIdleTimer) {
      clearTimeout(this.loadingIdleTimer);
      this.loadingIdleTimer = null;
    }
    if (this.tileLoadCounter > 0) {
      this.reportLoading(true);
    } else {
      // The counter dips to 0 between request batches while tiles stream in; only report "idle" after a quiet period
      // so the React tree is not re-rendered on every dip.
      this.loadingIdleTimer = setTimeout(() => {
        this.loadingIdleTimer = null;
        if (this.tileLoadCounter === 0) this.reportLoading(false);
      }, LOADING_IDLE_DELAY_MS);
    }
  }

  reportLoading(isLoading: boolean) {
    if (this.isReportedLoading === isLoading) return;
    this.isReportedLoading = isLoading;
    this.props.onLoadingStateChange?.(isLoading);
  }

  getPickingInfo({ info }: { info: PickingInfo }) {
    return info;
  }

  renderLayers() {
    const getTileData = async ({ index, bbox }: getTileDataProps) => {
      if (index || bbox) {
        this.updateLoadingState(1);
        try {
          const loader = this.state.loader as ZarrTranscriptLoader | false;
          const points = loader ? await loader.loadTileData(index.z, index.x, index.y) : emptyTile();

          // Legacy datasets without gene_order register genes while decoding: refresh the lookup if any appeared
          const registry = this.state.registry as GeneRegistry | null;
          if (registry && registry.version !== this.state.lookupRegistryVersion) {
            (this.getCurrentLayer() as TranscriptLayer | null)?.refreshGeneLookup();
          }

          const item: LayerDataItem = {
            index,
            textPosition: { x: bbox.top, y: bbox.left },
            boundingBox: [
              bbox.left,
              bbox.top,
              0,
              bbox.right,
              bbox.top,
              0,
              bbox.right,
              bbox.bottom,
              0,
              bbox.left,
              bbox.bottom,
              0
            ],
            points,
            tileData: {
              width: bbox.right - bbox.left,
              height: bbox.bottom - bbox.top
            }
          };
          return makeTileContent(item);
        } finally {
          this.updateLoadingState(-1);
        }
      }
      return [];
    };

    const { layer_height, layer_width, layers, tile_size } = this.props.config;

    let minZoom = 0;
    if (this.props.overrideLayers) {
      minZoom = layers - this.props.maxVisibleLayers;
    }

    const registry = this.state.registry as GeneRegistry | null;
    const geneNames = registry?.names ?? NO_GENES;
    const geneVisible = this.state.geneVisible as Uint8Array;
    const geneLookupTexture = this.state.lookupTexture as Texture;
    const geneLookupVersion = this.state.lookupVersion as number;

    const tiledLayer = new TranscriptTileLayer({
      id: `tiled_layer_${tile_size}_${layer_width}_${layer_height}_${layers}`,
      tileSize: tile_size,
      maxZoom: layers,
      minZoom: minZoom,
      zoomOffset: LAYER_ZOOM_OFFSET,
      extent: [0, 0, layer_width, layer_height],
      refinementStrategy: 'never',
      maxCacheByteSize: TRANSCRIPT_TILE_CACHE_BYTES,
      pickable: true,
      getTileData,
      updateTriggers: {
        getTileData: [this.props.zarrUrl, this.props.zarrStoreFactory, this.props.config]
      },
      pointSize: this.props.pointSize,
      showBoundries: this.props.showTilesBoundries,
      showData: this.props.showTilesData,
      showDiscardedPoints: this.props.showDiscardedPoints,
      geneNames,
      geneVisible,
      geneLookupTexture: registry ? geneLookupTexture : null,
      geneLookupVersion
    });
    return [tiledLayer];
  }
}

TranscriptLayer.layerName = 'TranscriptLayer';
export default TranscriptLayer;
