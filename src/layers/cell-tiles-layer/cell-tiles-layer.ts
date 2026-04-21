import { CompositeLayer, PickingInfo } from '@deck.gl/core';
import { PolygonLayer } from '@deck.gl/layers';
import { TileLayer } from '@deck.gl/geo-layers';
import { LAYER_ZOOM_OFFSET } from '../../shared/constants';
import { ZarrCellsTileLoader } from './zarr-cells-tile-loader';
import { CellTilesLayerProps, CellTilesSubLayerProps, GetCellTileDataProps } from './cell-tiles-layer.types';

class CellTilesSubLayer extends CompositeLayer<CellTilesSubLayerProps> {
  renderLayers() {
    const { tileData, parsedColorMap, cellFillOpacity, showCellFill, showBoundary, boundaryWidth } = this.props;
    const opacityValue = Math.round(cellFillOpacity * 255);
    const polygons = tileData[0]?.polygons ?? [];

    return [
      new PolygonLayer({
        id: `sub-cell-tile-polygon-layer-${this.props.id}`,
        data: polygons,
        positionFormat: 'XY',
        stroked: showBoundary,
        filled: showCellFill,
        getPolygon: (d) => d.vertices,
        getFillColor: (d) =>
          [...(parsedColorMap[d.clusterId] || [255, 255, 255]), opacityValue] as [number, number, number, number],
        getLineColor: (d) => (parsedColorMap[d.clusterId] as [number, number, number]) || [255, 255, 255],
        getLineWidth: showBoundary ? boundaryWidth : 0,
        updateTriggers: {
          getFillColor: [cellFillOpacity, parsedColorMap],
          getLineColor: parsedColorMap
        },
        pickable: true
      })
    ];
  }
}

CellTilesSubLayer.layerName = 'CellTilesSubLayer';

class CellTilesLayer extends CompositeLayer<CellTilesLayerProps> {
  parsedColorMap: Record<string, number[]>;
  zarrLoader: ZarrCellsTileLoader;
  tileLoadCounter: number;

  constructor(props: CellTilesLayerProps) {
    super(props);
    this.parsedColorMap = Object.fromEntries(props.colormap.map((entry) => [entry.clusterId, entry.color]));
    this.zarrLoader = new ZarrCellsTileLoader(props.zarrUrl);
    this.tileLoadCounter = 0;
  }

  updateLoadingState(delta: number) {
    const nextCounter = Math.max(this.tileLoadCounter + delta, 0);
    const hadPendingLoads = this.tileLoadCounter > 0;
    const hasPendingLoads = nextCounter > 0;
    this.tileLoadCounter = nextCounter;
    if (hadPendingLoads !== hasPendingLoads) {
      this.props.onLoadingStateChange?.(hasPendingLoads);
    }
  }

  getPickingInfo({ info }: { info: PickingInfo }) {
    return info;
  }

  renderLayers() {
    const { cellsLayerConfig, segmentationFolder, clusterLabelIndex } = this.props;
    const { layer_width, layer_height, layers, tile_size } = cellsLayerConfig;

    const getTileData = async ({ index }: GetCellTileDataProps) => {
      this.updateLoadingState(1);
      try {
        const tileData = await this.zarrLoader.loadTileData(segmentationFolder, index.x, index.y, clusterLabelIndex);
        if (!tileData) {
          return [{ polygons: [] }];
        }
        return [tileData];
      } finally {
        this.updateLoadingState(-1);
      }
    };

    const maxTileZoom = Math.max(layers - 1, 0);

    const tiledLayer = new TileLayer({
      id: `cell_tiled_layer_${segmentationFolder}_${tile_size}_${layer_width}_${layer_height}_${layers}`,
      tileSize: tile_size,
      maxZoom: maxTileZoom,
      minZoom: 0,
      zoomOffset: LAYER_ZOOM_OFFSET,
      extent: [0, 0, layer_width, layer_height],
      refinementStrategy: 'never',
      pickable: true,
      getTileData,
      updateTriggers: {
        getTileData: [this.props.zarrUrl, this.props.segmentationFolder, this.props.clusterLabelIndex]
      },
      renderSubLayers: ({ id, data }: any) =>
        new CellTilesSubLayer({
          id,
          tileData: data,
          parsedColorMap: this.parsedColorMap,
          cellFillOpacity: this.props.cellFillOpacity,
          showCellFill: this.props.showCellFill,
          showBoundary: this.props.showBoundary,
          boundaryWidth: this.props.boundaryWidth
        })
    });

    return [tiledLayer];
  }
}

CellTilesLayer.layerName = 'CellTilesLayer';
export default CellTilesLayer;
