import {
  TranscriptTileLayerProps,
  TranscriptLayerProps,
  getTileDataProps,
  LayerDataItem
} from './transcript-layer.types';
import { CompositeLayer, GetPickingInfoParams, Layer, LayerContext, UpdateParameters } from '@deck.gl/core';
import { PolygonLayer, TextLayer, ScatterplotLayer } from '@deck.gl/layers';
import { TileLayer } from '@deck.gl/geo-layers';
import type { _Tileset2D as Tileset2D } from '@deck.gl/geo-layers';
import type { Texture } from '@luma.gl/core';

import { LAYER_ZOOM_OFFSET } from '../../shared/constants';
import { ZarrTranscriptLoader } from './zarr-transcript-loader';
import { ColorMapEntry } from '../../stores/ZarrDataStore';
import { emptyTile } from '../../utils/transcriptTileDecode';
import type { GeneNameFilterType } from '../../stores/TranscriptLayerStore';
import { GeneRegistry } from '../../utils/GeneRegistry';
import type { GeneGroupedTranscriptSource } from '../../utils/GeneGroupedTranscriptSource';
import GeneFilteredTranscriptLayer from './gene-filtered-layer';
import {
  TileBucket,
  BucketEntry,
  TileSequencer,
  makeTileContent,
  updateBuckets,
  resolveBucketIndex,
  sameItems
} from './tile-buckets';
import { GENE_LOOKUP_EXTENSIONS, WHITE, createGeneLookupTexture, fillGeneLookup } from './gene-lookup-extension';

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

/**
 * Byte budget of deck's tile cache (typed arrays owned by cached tiles, see makeTileContent). A full-resolution full
 * view (~2,000 tiles) needs ~150 MB. Tiles that are selected or visible are never evicted, even if they alone exceed
 * the budget; older invisible tiles go first.
 */
const TRANSCRIPT_TILE_CACHE_BYTES = 250 * 1024 * 1024;

/**
 * How long hidden transcript data is kept: the unticked transcript layer, the unfiltered tiles after a gene-store swap
 * and the gene chunks of the last filter after filter off.
 */
export const HIDDEN_GRACE_MS = 60_000;

const BOUNDARY_COLOR: [number, number, number] = [255, 255, 255];
const LABEL_COLOR: [number, number, number, number] = [255, 255, 255, 255];
const LABEL_BACKGROUND: [number, number, number, number] = [0, 0, 0, 150];

type DebugLabel = { textLabel: string; position: [number, number] };
type LabelsState = { items: LayerDataItem[]; geneVisible: Uint8Array; version: number; data: DebugLabel[] };

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
  updateState(params: UpdateParameters<this>) {
    const { props, oldProps } = params;
    const state = this.state as unknown as { tileset: Tileset2D | null; isLoaded: boolean };
    if (!props.visible) {
      // Hidden (grace period): keep the cached tiles but freeze the tileset, so pans / zooms select and fetch nothing.
      // Queued loads are cancelled (they never reach getTileData); the next visible update reloads what is selected.
      if (oldProps.visible !== false) for (const tile of state.tileset?.tiles ?? []) if (tile.isLoading) tile.abort();
      return;
    }
    // Shown again: report onViewportLoad even if the tileset did not change while hidden (the parent waits for it)
    if (oldProps.visible === false) state.isLoaded = false;
    super.updateState(params);
  }

  initializeState() {
    super.initializeState();
    Object.assign(this.state, {
      buckets: new Map<string, TileBucket>(),
      sequencer: new TileSequencer<object>(),
      visibleItems: [] as LayerDataItem[],
      labels: null as LabelsState | null
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
      labels: LabelsState | null;
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
      discardedOnly,
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
      if (showDiscardedPoints || discardedOnly) {
        layers.push(
          new ScatterplotLayer(
            this.getSubLayerProps({
              id: `discarded-${bucket.key}`,
              data: bucket.data,
              getLineWidth: 0.2,
              getRadius: pointSize,
              radiusUnits: 'pixels',
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
      if (discardedOnly) continue;
      layers.push(
        new ScatterplotLayer(
          this.getSubLayerProps({
            id: `points-${bucket.key}`,
            data: bucket.data,
            bucket,
            getFillColor: WHITE,
            getRadius: pointSize,
            radiusUnits: 'pixels',
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

/**
 * Loading bookkeeping lives in layer state, not on the instance: deck creates a new layer instance on every update
 * and transfers only `state`, while in-flight getTileData closures keep calling the instance that created them.
 */
type LoadingState = {
  /** In-flight normal tile loads */
  counter: number;
  idleTimer: ReturnType<typeof setTimeout> | null;
  /** Loading flags of the two sources of work (normal tiles, gene-filtered chunks); the UI sees their OR */
  tiles: boolean;
  genes: boolean;
  isReported: boolean;
  onChange: ((isLoading: boolean) => void) | undefined;
};

/** Hidden grace periods (shared like LoadingState: survives layer instance changes) */
type GraceTimers = {
  unfiltered: ReturnType<typeof setTimeout> | null;
  genes: ReturnType<typeof setTimeout> | null;
};

function setLoadingFlag(loading: LoadingState, source: 'tiles' | 'genes', isLoading: boolean) {
  loading[source] = isLoading;
  const any = loading.tiles || loading.genes;
  if (loading.isReported === any) return;
  loading.isReported = any;
  loading.onChange?.(any);
}

class TranscriptLayer extends CompositeLayer<TranscriptLayerProps> {
  initializeState() {
    const loading: LoadingState = {
      counter: 0,
      idleTimer: null,
      tiles: false,
      genes: false,
      isReported: false,
      onChange: undefined
    };
    this.setState({
      loader: null,
      registry: null as GeneRegistry | null,
      lookupTexture: createGeneLookupTexture(this.context.device),
      lookupVersion: 0,
      geneVisible: NO_VISIBLE,
      lookupRegistryVersion: -1,
      sourceVersion: 0,
      loading,
      // undefined: not requested yet, null: dataset has no (valid) gene-grouped store
      geneStore: undefined as GeneGroupedTranscriptSource | null | undefined,
      geneStoreRequested: false,
      // true once the gene-filtered layer has drawn its first complete view (the normal tile layer is then removed)
      filteredReady: false,
      activeGenes: null as GeneNameFilterType | null,
      // Filter just turned off: the filtered layer keeps drawing these genes until the normal tiles loaded
      heldGenes: null as GeneNameFilterType | null,
      grace: { unfiltered: null, genes: null } as GraceTimers,
      // Gene store: unfiltered tiles kept mounted (hidden) after the filtered layer took over
      unfilteredHeld: false,
      // Gene store: genes of the filtered layer kept mounted (hidden, chunk cache kept) after the filter turned off
      graceGenes: null as GeneNameFilterType | null,
      onGeneLoading: (isLoading: boolean) => setLoadingFlag(loading, 'genes', isLoading),
      // Level drawn by the gene-filtered layer (null when none); reported only while it is the visible layer
      drawnLevel: null as number | null,
      reportedLevel: null as number | null,
      onFilteredLevel: (level: number | null) => {
        const current = this.getCurrentLayer() as TranscriptLayer | null;
        if (!current) return;
        current.state.drawnLevel = level;
        current.reportFilteredLevel();
      },
      onFilteredReady: () => {
        const current = this.getCurrentLayer() as TranscriptLayer | null;
        if (!current || current.props.geneFilters === 'all' || current.state.filteredReady) return;
        current.setState({ filteredReady: true });
        current.startGrace('unfiltered');
        current.reportFilteredLevel();
        current.setNeedsUpdate();
      },
      onTilesReady: () => {
        // deferred: the tile layer reports from inside this layer's own sublayer update pass
        void Promise.resolve().then(() => {
          const current = this.getCurrentLayer() as TranscriptLayer | null;
          if (!current?.state.heldGenes) return;
          current.setState({ graceGenes: current.state.heldGenes, heldGenes: null });
          current.startGrace('genes');
          current.setNeedsUpdate();
        });
      }
    });
  }

  /** Keeps the unfiltered tiles / the gene chunks of the last filter (both hidden) for HIDDEN_GRACE_MS, then frees them */
  startGrace(kind: keyof GraceTimers) {
    const timers = this.state.grace as GraceTimers;
    if (timers[kind]) clearTimeout(timers[kind]);
    timers[kind] = null;
    timers[kind] = setTimeout(() => {
      timers[kind] = null;
      (this.getCurrentLayer() as TranscriptLayer | null)?.endGrace(kind);
    }, HIDDEN_GRACE_MS);
    if (kind === 'unfiltered') this.setState({ unfilteredHeld: true });
  }

  /** Ends a grace period now: the held layer is no longer rendered, so deck finalizes it and frees its data */
  endGrace(kind: keyof GraceTimers) {
    const timers = this.state.grace as GraceTimers;
    if (timers[kind]) clearTimeout(timers[kind]);
    timers[kind] = null;
    if (kind === 'unfiltered' ? this.state.unfilteredHeld : this.state.graceGenes) {
      this.setState(kind === 'unfiltered' ? { unfilteredHeld: false } : { graceGenes: null });
      this.setNeedsUpdate();
    }
  }

  /** Tells the UI which level the gene store draws (null: the normal tile layer draws, label follows the zoom) */
  reportFilteredLevel() {
    const level =
      this.props.geneFilters !== 'all' && this.state.filteredReady ? (this.state.drawnLevel as number | null) : null;
    if (level === this.state.reportedLevel) return;
    this.state.reportedLevel = level;
    // deferred: may run inside deck's update pass; the callback sets React-visible store state
    void Promise.resolve().then(() => this.props.onFilteredLevelChange?.(level));
  }

  finalizeState(context: LayerContext) {
    super.finalizeState(context);
    this.props.onFilteredLevelChange?.(null);
    const loading = this.state.loading as LoadingState;
    if (loading.idleTimer) clearTimeout(loading.idleTimer);
    loading.idleTimer = null;
    const timers = this.state.grace as GraceTimers;
    for (const kind of ['unfiltered', 'genes'] as const) {
      if (timers[kind]) clearTimeout(timers[kind]);
      timers[kind] = null;
    }
    // The layer is gone: nothing will report idle later, so do it now or the loading bar stays on
    loading.counter = 0;
    loading.genes = false;
    setLoadingFlag(loading, 'tiles', false);
    (this.state.lookupTexture as Texture | undefined)?.destroy();
  }

  updateState({ props, oldProps }: UpdateParameters<this>) {
    (this.state.loading as LoadingState).onChange = props.onLoadingStateChange;
    const sourceChanged =
      !this.state.loader || props.zarrUrl !== oldProps.zarrUrl || props.zarrStoreFactory !== oldProps.zarrStoreFactory;

    if (sourceChanged) {
      this.endGrace('unfiltered');
      this.endGrace('genes');
    }

    if (sourceChanged) {
      const loader =
        props.zarrUrl || props.zarrStoreFactory
          ? new ZarrTranscriptLoader(props.zarrUrl ?? undefined, props.zarrStoreFactory)
          : null;
      // sourceVersion is part of the tile layer id: a new source starts a fresh tileset (cache, byte count, buckets)
      this.setState({
        loader: loader ?? false,
        registry: null,
        lookupRegistryVersion: -1,
        sourceVersion: (this.state.sourceVersion as number) + 1,
        geneStore: undefined,
        geneStoreRequested: false,
        filteredReady: false,
        activeGenes: null,
        heldGenes: null,
        drawnLevel: null
      });
      loader?.ready.then((registry) => {
        if (this.state.loader !== loader) return;
        this.setState({ registry });
        (this.getCurrentLayer() as TranscriptLayer | null)?.refreshGeneLookup();
      });
    }

    if (sourceChanged || props.geneFilters !== oldProps.geneFilters || props.colormap !== oldProps.colormap) {
      this.refreshGeneLookup();
    }

    this.updateGeneStore(props.geneFilters);
  }

  /**
   * The gene-grouped store is only requested once a gene filter is on (no filter => zero requests to it). While it is
   * pending or unavailable the GPU filter of the normal tile layer is used.
   */
  updateGeneStore(geneFilters: GeneNameFilterType | 'all') {
    if (geneFilters !== 'all') {
      this.setState({ activeGenes: geneFilters, heldGenes: null });
      if (this.state.graceGenes) this.endGrace('genes'); // the (hidden) filtered layer is drawn again
    } else if (this.state.filteredReady) {
      // Filter off without a blank view: the normal tile layer is drawn now (mounted again unless still held); the
      // filtered layer stays until it loaded, then is kept hidden for the grace period (onTilesReady)
      this.setState({ filteredReady: false, heldGenes: this.state.activeGenes, activeGenes: null });
      this.endGrace('unfiltered');
      this.reportFilteredLevel();
    } else if (this.state.activeGenes) {
      // Filter off before the filtered layer was ready: the tile layer is drawn anyway; keep the chunks (gene store
      // only: on 4.0 data / without a store there is no filtered layer)
      const graceGenes = this.state.geneStore ? this.state.activeGenes : null;
      this.setState({ graceGenes, activeGenes: null });
      if (graceGenes) this.startGrace('genes');
    }
    const loader = this.state.loader as ZarrTranscriptLoader | false;
    if (geneFilters === 'all' || !loader || this.state.geneStoreRequested) return;
    this.setState({ geneStoreRequested: true });
    loader.ready
      .then(() => loader.getGeneStore())
      .then((geneStore) => {
        if (this.state.loader !== loader) return;
        const current = this.getCurrentLayer() as TranscriptLayer | null;
        current?.setState({ geneStore });
        current?.refreshGeneLookup(); // registers the store's genes, then flags a redraw
      });
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
    // Every gene the gene-filtered layer draws must have a lookup index: register names the dataset did not list
    // (GeneRegistry appends them and bumps its version)
    const geneStore = this.state.geneStore as GeneGroupedTranscriptSource | null | undefined;
    if (filter && geneStore) for (const name of filter) if (geneStore.geneIndex(name) !== undefined) registry.add(name);
    const visibleFlags = new Uint8Array(registry.names.length);
    for (let i = 0; i < registry.names.length; i++) {
      visibleFlags[i] = !filter || filter.has(registry.names[i]) ? 1 : 0;
    }
    fillGeneLookup(texture, registry.names, colors, visibleFlags);
    this.setState({
      geneVisible: visibleFlags,
      lookupVersion: (this.state.lookupVersion as number) + 1,
      lookupRegistryVersion: registry.version
    });
    // setState already flags a redraw; setNeedsUpdate propagates the new lookup version to the tile sublayers.
    this.setNeedsUpdate();
  }

  updateLoadingState(delta: number) {
    const loading = this.state.loading as LoadingState;
    loading.counter = Math.max(loading.counter + delta, 0);
    if (loading.idleTimer) {
      clearTimeout(loading.idleTimer);
      loading.idleTimer = null;
    }
    if (loading.counter > 0) {
      this.reportLoading(true);
    } else {
      // The counter dips to 0 between request batches while tiles stream in; only report "idle" after a quiet period
      // so the React tree is not re-rendered on every dip.
      loading.idleTimer = setTimeout(() => {
        loading.idleTimer = null;
        if (loading.counter === 0) this.reportLoading(false);
      }, LOADING_IDLE_DELAY_MS);
    }
  }

  reportLoading(isLoading: boolean) {
    setLoadingFlag(this.state.loading as LoadingState, 'tiles', isLoading);
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

    // Gene filter on + gene-grouped store available: the gene-filtered layer draws the selected genes. The normal
    // layer stays (GPU filter) until that layer completed its first view, then it is removed so deck finalizes it
    // and frees its tiles. "Show Discarded" keeps a normal layer mounted that only draws the discarded points.
    // Filter just turned off: the filtered layer stays (heldGenes) until the normal tiles loaded (onTilesReady).
    // Within a grace period the removed layer stays mounted but hidden (visible: false: not drawn, not fetching).
    const { geneFilters, showDiscardedPoints } = this.props;
    const layerVisible = this.props.visible !== false;
    const geneStore = this.state.geneStore as GeneGroupedTranscriptSource | null | undefined;
    const heldGenes = this.state.heldGenes as GeneNameFilterType | null;
    const drawFiltered = geneFilters !== 'all' || !!heldGenes;
    const filteredGenes =
      geneFilters === 'all' ? (heldGenes ?? (this.state.graceGenes as GeneNameFilterType | null)) : geneFilters;
    const useGeneStore = !!filteredGenes && !!geneStore && !!registry;
    const filteredReady = geneFilters !== 'all' && useGeneStore && (this.state.filteredReady as boolean);
    const drawTiles = !filteredReady || showDiscardedPoints;
    const result: Layer[] = [];

    if (useGeneStore) {
      result.push(
        new GeneFilteredTranscriptLayer({
          id: `${this.props.id}-gene-filtered-${this.state.sourceVersion}`,
          visible: layerVisible && drawFiltered,
          awaitingReady: geneFilters !== 'all' && !filteredReady,
          source: geneStore,
          genes: filteredGenes,
          lookupIndexOf: (name: string) => registry.indexOf(name),
          pointSize: this.props.pointSize,
          geneLookupTexture,
          geneLookupVersion,
          layers,
          overrideLayers: this.props.overrideLayers,
          maxVisibleLayers: this.props.maxVisibleLayers,
          onLoadingStateChange: this.state.onGeneLoading as (isLoading: boolean) => void,
          onLevelChange: this.state.onFilteredLevel as (level: number | null) => void,
          onReady: this.state.onFilteredReady as () => void,
          pickable: true
        })
      );
    }
    if (!drawTiles && !this.state.unfilteredHeld) return result;

    const tiledLayer = new TranscriptTileLayer({
      id: `tiled_layer_${this.state.sourceVersion}_${tile_size}_${layer_width}_${layer_height}_${layers}`,
      tileSize: tile_size,
      maxZoom: layers,
      minZoom: minZoom,
      zoomOffset: LAYER_ZOOM_OFFSET,
      extent: [0, 0, layer_width, layer_height],
      visible: layerVisible && drawTiles,
      refinementStrategy: 'never',
      maxCacheByteSize: TRANSCRIPT_TILE_CACHE_BYTES,
      pickable: true,
      getTileData,
      pointSize: this.props.pointSize,
      showBoundries: this.props.showTilesBoundries,
      showData: this.props.showTilesData,
      showDiscardedPoints,
      // false while held (hidden), so it keeps its full sublayers and re-showing reuses them
      discardedOnly: filteredReady && drawTiles,
      onViewportLoad: this.state.onTilesReady as () => void,
      geneNames,
      geneVisible,
      geneLookupTexture: registry ? geneLookupTexture : null,
      geneLookupVersion
    });
    result.push(tiledLayer);
    return result;
  }
}

TranscriptLayer.layerName = 'TranscriptLayer';
export default TranscriptLayer;
