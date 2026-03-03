import { SingleTileLayerProps, TranscriptLayerProps, getTileDataProps } from './transcript-layer.types';
import { CompositeLayer, PickingInfo } from '@deck.gl/core';
import { PolygonLayer, TextLayer, ScatterplotLayer } from '@deck.gl/layers';
import { TileLayer } from '@deck.gl/geo-layers';

import { partition } from 'lodash';
import { LAYER_ZOOM_OFFSET } from '../../shared/constants';
import { ZarrTranscriptLoader } from './zarr-transcript-loader';

class SingleTileLayer extends CompositeLayer<SingleTileLayerProps> {
  renderLayers() {
    const boundingBoxLayer = new PolygonLayer({
      id: `sub-polygon-layer-${this.props.id}`,
      data: this.props.layerData,
      filled: false,
      wireframe: false,
      getPolygon: (d) => d.boundingBox,
      getLineWidth: 5,
      lineWidthMaxPixels: 5,
      getLineColor: [255, 255, 255],
      visible: this.props.showBoundries
    });

    const { index, textPosition, points, outlierPoints, tileData } = this.props.layerData[0];

    // @ INFO TEXT LAYER
    const textLayer = new TextLayer({
      id: `sub-text-layer-${this.props.id}`,
      data: [
        {
          textLabel: `[${index.x}, ${index.y}, ${index.z}]|[${tileData.width}, ${tileData.height}]|${
            Array.isArray(points) ? points.length : points
          }`,
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
      getBackgroundColor: [0, 0, 0, 150],
      visible: this.props.showData
    });

    // @ POINTS LAYERS
    const discardedPointsLayer = new ScatterplotLayer({
      id: `sub-discarded-point-layer-${this.props.id}`,
      data: outlierPoints,
      getPosition: (d) => d.position,
      getLineColor: [238, 238, 238],
      getLineWidth: 0.2,
      getRadius: this.props.pointSize,
      radiusUnits: 'pixels',
      filled: false,
      stroked: true,
      visible: this.props.showDiscardedPoints
    });

    const pointsLayer = new ScatterplotLayer({
      id: `sub-point-layer-${this.props.id}`,
      data: points,
      getPosition: (d) => d.position,
      getFillColor: (d) => (this.props.parsedColorMap[d.geneName] as [number, number, number]) || [255, 255, 255],
      getRadius: this.props.pointSize,
      radiusUnits: 'pixels',
      pickable: true
    });

    return [boundingBoxLayer, textLayer, discardedPointsLayer, pointsLayer];
  }
}

SingleTileLayer.layerName = 'SingleTileLayer';

class TranscriptLayer extends CompositeLayer<TranscriptLayerProps> {
  parsedColorMap: Record<string, number[]>;
  zarrLoader: ZarrTranscriptLoader | null;
  tileLoadCounter: number;

  constructor(props: TranscriptLayerProps) {
    super(props);
    this.parsedColorMap = Object.fromEntries(props.colormap.map((entry) => [entry.gene_name, entry.color]));
    this.zarrLoader = props.zarrUrl ? new ZarrTranscriptLoader(props.zarrUrl) : null;
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

  async loadMetadata(zoom: number, tileX: number, tileY: number) {
    // If Zarr loader is available, use it
    if (this.zarrLoader) {
      const zarrData = await this.zarrLoader.loadTileData(zoom, tileX, tileY);
      if (zarrData) {
        return zarrData;
      }
      return { pointsData: [], numberOfPoints: 0 };
    }

    // Legacy path - kept for ROI detection.
    // TODO: remove when ROI transcript detection is migrated to Zarr
    return { pointsData: [], numberOfPoints: 0 };
  }

  getPickingInfo({ info }: { info: PickingInfo }) {
    return info;
  }

  renderLayers() {
    const getTileData = async ({ index, bbox }: getTileDataProps) => {
      if (index || bbox) {
        this.updateLoadingState(1);
        try {
          const metadata = (await this.loadMetadata(index.z, index.x, index.y)) as any;

          let pointsData = [];
          let outlierPointsData = [];

          if (this.props.geneFilters === 'all') {
            pointsData = metadata.pointsData;
          } else {
            [pointsData, outlierPointsData] = partition(metadata.pointsData, (data) =>
              this.props.geneFilters.includes(data.geneName)
            );
          }

          return [
            {
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
              points: pointsData,
              outlierPoints: outlierPointsData,
              tileData: {
                width: bbox.right - bbox.left,
                height: bbox.bottom - bbox.top
              }
            }
          ];
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
        getTileData: [
          this.props.files,
          this.props.zarrUrl,
          this.props.visible,
          this.props.geneFilters,
          this.props.showDiscardedPoints,
          this.props.pointSize,
          this.props.colormap,
          this.props.config
        ]
      },
      renderSubLayers: ({ id, data }) =>
        new SingleTileLayer({
          id,
          layerData: data,
          pointSize: this.props.pointSize,
          showBoundries: this.props.showTilesBoundries,
          showData: this.props.showTilesData,
          showDiscardedPoints: this.props.showDiscardedPoints,
          parsedColorMap: this.parsedColorMap
        })
    });
    return [tiledLayer];
  }
}

TranscriptLayer.layerName = 'TranscriptLayer';
export default TranscriptLayer;
