import { SingleTileLayerProps, TranscriptLayerProps, getTileDataProps, LayerDataItem } from './transcript-layer.types';
import { CompositeLayer, PickingInfo, UpdateParameters } from '@deck.gl/core';
import { PolygonLayer, TextLayer, ScatterplotLayer } from '@deck.gl/layers';
import { TileLayer } from '@deck.gl/geo-layers';
import type { Texture } from '@luma.gl/core';

import { LAYER_ZOOM_OFFSET } from '../../shared/constants';
import { ZarrTranscriptLoader } from './zarr-transcript-loader';
import { ColorMapEntry } from '../../stores/ZarrDataStore';
import { emptyTile } from '../../utils/transcriptTileDecode';
import { GeneRegistry } from '../../utils/GeneRegistry';
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

class SingleTileLayer extends CompositeLayer<SingleTileLayerProps> {
  // Binary attribute payload is built once per tile (stable identity => attributes are uploaded to the GPU once).
  updateState({ props, oldProps, changeFlags }: UpdateParameters<this>) {
    if (changeFlags.dataChanged || props.layerData !== oldProps.layerData || !this.state.binaryData) {
      const { points } = props.layerData[0];
      this.setState({
        binaryData: {
          length: points.length,
          attributes: {
            getPosition: { value: points.positions, size: 2 },
            getGeneIndex: { value: points.geneIndex, size: 1 }
          }
        }
      });
    }
    // Debug label only: number of points passing the filter (O(points), skipped unless the label is shown)
    if (
      props.showData &&
      (changeFlags.dataChanged ||
        props.layerData !== oldProps.layerData ||
        props.geneLookupVersion !== oldProps.geneLookupVersion ||
        !oldProps.showData)
    ) {
      const { geneIndex, length } = props.layerData[0].points;
      let visible = 0;
      for (let i = 0; i < length; i++) visible += props.geneVisible[geneIndex[i]];
      this.setState({ visibleCount: visible });
    }
  }

  getPickingInfo({ info }: { info: PickingInfo }) {
    if (info.index >= 0) {
      const { points } = this.props.layerData[0];
      const i = info.index;
      if (i < points.length) {
        // Resolve the hovered point lazily from the typed arrays (no per-point objects exist)
        info.object = {
          position: [points.positions[2 * i], points.positions[2 * i + 1]],
          geneName: this.props.geneNames[points.geneIndex[i]] ?? '',
          cellId: String(points.cellId[i])
        };
      }
    }
    return info;
  }

  renderLayers() {
    const { index, textPosition, tileData, points } = this.props.layerData[0];
    const binaryData = this.state.binaryData as { length: number; attributes: Record<string, any> };
    const visibleCount = this.state.visibleCount as number | undefined;
    const layers = [];

    if (this.props.showBoundries) {
      layers.push(
        new PolygonLayer({
          id: `sub-polygon-layer-${this.props.id}`,
          data: this.props.layerData,
          filled: false,
          wireframe: false,
          getPolygon: (d) => d.boundingBox,
          getLineWidth: 5,
          lineWidthMaxPixels: 5,
          getLineColor: [255, 255, 255]
        })
      );
    }

    // @ INFO TEXT LAYER
    if (this.props.showData) {
      layers.push(
        new TextLayer({
          id: `sub-text-layer-${this.props.id}`,
          data: [
            {
              textLabel: `[${index.x}, ${index.y}, ${index.z}]|[${tileData.width}, ${tileData.height}]|${visibleCount ?? points.length}`,
              position: [textPosition.y, textPosition.x]
            }
          ],
          getPosition: (d) => d.position,
          getText: (d) => d.textLabel,
          getTextAnchor: 'start',
          getAlignmentBaseline: 'top',
          getSize: 10,
          getColor: [255, 255, 255, 255],
          background: true,
          backgroundPadding: [5, 5],
          getBackgroundColor: [0, 0, 0, 150]
        })
      );
    }

    if (!this.props.geneLookupTexture || points.length === 0) return layers;

    // @ POINTS LAYERS
    // Both layers share the same binary attributes; the gene lookup texture decides, per point and on the GPU,
    // which of them draws it (and with what color). Filtering never rebuilds per-point data.
    if (this.props.showDiscardedPoints) {
      layers.push(
        new ScatterplotLayer({
          id: `sub-discarded-point-layer-${this.props.id}`,
          data: binaryData,
          getFillColor: [255, 255, 255],
          getLineColor: [238, 238, 238],
          getLineWidth: 0.2,
          getRadius: this.props.pointSize,
          radiusUnits: 'pixels',
          updateTriggers: { getRadius: this.props.pointSize },
          filled: false,
          stroked: true,
          extensions: GENE_LOOKUP_EXTENSIONS,
          geneLookupTexture: this.props.geneLookupTexture,
          geneLookupVersion: this.props.geneLookupVersion,
          geneLookupMode: 'discarded'
        } as any)
      );
    }

    layers.push(
      new ScatterplotLayer({
        id: `sub-point-layer-${this.props.id}`,
        data: binaryData,
        getFillColor: [255, 255, 255],
        getRadius: this.props.pointSize,
        radiusUnits: 'pixels',
        updateTriggers: { getRadius: this.props.pointSize },
        pickable: true,
        extensions: GENE_LOOKUP_EXTENSIONS,
        geneLookupTexture: this.props.geneLookupTexture,
        geneLookupVersion: this.props.geneLookupVersion,
        geneLookupMode: 'visible'
      } as any)
    );
    return layers;
  }
}

SingleTileLayer.layerName = 'SingleTileLayer';

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
          return [item];
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

    const tiledLayer = new TileLayer({
      id: `tiled_layer_${tile_size}_${layer_width}_${layer_height}_${layers}`,
      tileSize: tile_size,
      maxZoom: layers,
      minZoom: minZoom,
      zoomOffset: LAYER_ZOOM_OFFSET,
      extent: [0, 0, layer_width, layer_height],
      refinementStrategy: 'never',
      pickable: true,
      getTileData,
      updateTriggers: {
        getTileData: [this.props.zarrUrl, this.props.zarrStoreFactory, this.props.config]
      },
      renderSubLayers: ({ id, data }) =>
        new SingleTileLayer({
          id,
          layerData: data,
          pointSize: this.props.pointSize,
          showBoundries: this.props.showTilesBoundries,
          showData: this.props.showTilesData,
          showDiscardedPoints: this.props.showDiscardedPoints,
          geneNames,
          geneVisible,
          geneLookupTexture: registry ? geneLookupTexture : null,
          geneLookupVersion
        })
    });
    return [tiledLayer];
  }
}

TranscriptLayer.layerName = 'TranscriptLayer';
export default TranscriptLayer;
