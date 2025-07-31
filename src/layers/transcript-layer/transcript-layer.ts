import { SingleTileLayerProps, TranscriptLayerProps, getTileDataProps } from './transcript-layer.types';
import { CompositeLayer, PickingInfo } from '@deck.gl/core';
import { PolygonLayer, TextLayer, ScatterplotLayer } from '@deck.gl/layers';
import { TileLayer } from '@deck.gl/geo-layers';

import * as protobuf from 'protobufjs';
import { TranscriptSchema } from './transcript-schema';
import { partition } from 'lodash';

// ======================== DATA TILE LAYER ==================

class SingleTileLayer extends CompositeLayer<SingleTileLayerProps> {
  renderLayers() {
    // @ BOUNDING BOX LAYER @
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

    // @ INFO TEXT LAYER
    const { index, textPosition, points, unselectedPoints, selectedPoints, outlierPoints, tileData } =
      this.props.layerData[0];

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

    const unselectedPointsLayer = new ScatterplotLayer({
      id: `sub-point-layer-${this.props.id}`,
      data: unselectedPoints,
      getPosition: (d) => d.position,
      getFillColor: (d) => d.color,
      getRadius: this.props.pointSize,
      radiusUnits: 'pixels',
      pickable: true
    });

    const selectedPointsLayer = new ScatterplotLayer({
      id: `sub-selected-points-layer-${this.props.id}`,
      data: selectedPoints,
      getPosition: (d) => d.position,
      getFillColor: (d) => d.color,
      getLineColor: [255, 255, 255],
      getLineWidth: 1.5,
      getRadius: this.props.pointSize + 0.5,
      stroked: true,
      radiusUnits: 'pixels',
      lineWidthUnits: 'pixels',
      pickable: true,
      visible: selectedPoints.length > 0
    });

    return [boundingBoxLayer, textLayer, discardedPointsLayer, unselectedPointsLayer, selectedPointsLayer];
  }
}

SingleTileLayer.layerName = 'SingleTileLayer';

class TranscriptLayer extends CompositeLayer<TranscriptLayerProps> {
  protoRoot: protobuf.Root;

  constructor(props: TranscriptLayerProps) {
    super(props);
    this.protoRoot = protobuf.Root.fromJSON(TranscriptSchema);
  }

  async loadMetadata(zoom: number, tileY: number, tileX: number) {
    const suffix = `/${zoom}/${tileX}/${tileY}.bin`;
    const file = this.props.files.find((f: File) => f.name.endsWith(suffix));

    if (!file) return Promise.resolve([]);

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const arrayBuffer = reader.result as ArrayBuffer;
          const data = this.protoRoot.lookupType('TileData').decode(new Uint8Array(arrayBuffer));
          resolve(data);
        } catch (error) {
          reject([]);
        }
      };
      reader.onerror = () => {
        reject([]);
      };
      reader.readAsArrayBuffer(file);
    });
  }

  getPickingInfo({ info }: { info: PickingInfo }) {
    return info;
  }

  renderLayers() {
    // ========================= TILED LAYER =====================
    const getTileData = async ({ index, bbox }: getTileDataProps) => {
      if (index || bbox) {
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

        const selectedPositionsSet = new Set(
          this.props.selectedPoints.map((selectedPoint) => `${selectedPoint.position[0]},${selectedPoint.position[1]}`)
        );

        const selectedPointsData = [];
        const unselectedPointsData = [];

        for (const point of pointsData) {
          const positionKey = `${point.position[0]},${point.position[1]}`;
          if (selectedPositionsSet.has(positionKey)) {
            selectedPointsData.push(point);
          } else {
            unselectedPointsData.push(point);
          }
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
            unselectedPoints: unselectedPointsData,
            selectedPoints: selectedPointsData,
            outlierPoints: outlierPointsData,
            tileData: {
              width: bbox.right - bbox.left,
              height: bbox.bottom - bbox.top
            }
          }
        ];
      }
      return [];
    };

    const { layer_height, layer_width, layers, tile_size } = this.props.config;

    let minZoom = 0;
    if (this.props.overrideLayers) {
      minZoom = layers - this.props.maxVisibleLayers;
    }

    const tiledLayer = new TileLayer({
      id: 'tiled_layer',
      tileSize: tile_size,
      maxZoom: layers,
      minZoom,
      zoomOffset: 2,
      extent: [0, 0, layer_width, layer_height],
      refinementStrategy: 'never',
      pickable: true,
      getTileData,
      updateTriggers: {
        getTileData: [
          this.props.files,
          this.props.visible,
          this.props.geneFilters,
          this.props.showDiscardedPoints,
          this.props.pointSize,
          this.props.selectedPoints
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
          selectedPoints: this.props.selectedPoints
        })
    });
    return [tiledLayer];
  }
}

TranscriptLayer.layerName = 'TranscriptLayer';
export default TranscriptLayer;
