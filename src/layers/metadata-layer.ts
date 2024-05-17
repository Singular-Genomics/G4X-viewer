import {
  SingleTileLayerProps,
  MetadataLayerProps,
  getTileDataProps,
} from "./metadata-layer.types";
import { CompositeLayer } from "@deck.gl/core/typed";
import {
  PolygonLayer,
  TextLayer,
  ScatterplotLayer,
} from "@deck.gl/layers/typed";
import { TileLayer } from "@deck.gl/geo-layers/typed";

import * as protobuf from "protobufjs";
import { MetadataSchema } from "./metadata-schema";

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
    });

    // @ INFO TEXT LAYER
    const { index, textPosition, points, tileData } = this.props.layerData[0];

    const textLayer = new TextLayer({
      id: `sub-text-layer-${this.props.id}`,
      data: [
        {
          textLabel: `[${index.x}, ${index.y}, ${index.z}]|[${
            tileData.width
          }, ${tileData.height}]|${
            Array.isArray(points) ? points.length : points
          }`,
          position: [textPosition.y, textPosition.x],
        },
      ],
      getPosition: (d) => d.position,
      getText: (d) => d.textLabel,
      getTextAnchor: "start",
      getAlignmentBaseline: "top",
      getSize: 10,
      getColor: [255, 255, 255, 255],
      background: true,
      backgroundPadding: [5, 5],
      getBackgroundColor: [0, 0, 0, 150],
    });

    // @ POINTS LAYER

    const pointsLayer = new ScatterplotLayer({
      id: `sub-point-layer-${this.props.id}`,
      data: points,
      getPosition: (d) => d.position,
      getFillColor: (d) => d.color,
      getRadius: this.props.pointSize,
      radiusUnits: "pixels",
      pickable: true,
    });

    return [boundingBoxLayer, textLayer, pointsLayer];
    // return [pointsLayer];
  }
}

SingleTileLayer.layerName = "SingleTileLayer";

class MetadataLayer extends CompositeLayer<MetadataLayerProps> {
  protoRoot: protobuf.Root;

  constructor(props: MetadataLayerProps) {
    super(props);
    this.protoRoot = protobuf.Root.fromJSON(MetadataSchema);
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
          const data = this.protoRoot
            .lookupType("TileData")
            .decode(new Uint8Array(arrayBuffer));
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

  renderLayers() {
    // ========================= TILED LAYER =====================
    const getTileData = async ({ index, bbox }: getTileDataProps) => {
      if (index || bbox) {
        const metadata = (await this.loadMetadata(
          index.z,
          index.x,
          index.y
        )) as any;

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
              0,
            ],
            points: metadata.pointsData || [],
            tileData: {
              width: bbox.right - bbox.left,
              height: bbox.bottom - bbox.top,
            },
          },
        ];
      }
      return [];
    };

    const { layer_height, layer_width, layers, tile_size } = this.props.config;

    const tiledLayer = new TileLayer(this.props, {
      id: "tiled_layer",
      tileSize: tile_size,
      maxZoom: layers,
      minZoom: 0,
      zoomOffset: 2,
      extent: [0, 0, layer_width, layer_height],
      refinementStrategy: "never",
      getTileData,
      updateTriggers: { getTileData: [this.props.files, this.props.visible] },
      renderSubLayers: ({ id, data }) =>
        new SingleTileLayer({
          id,
          layerData: data,
          pointSize: this.props.pointSize,
        }),
    });
    return [tiledLayer];
  }
}

MetadataLayer.layerName = "MetadataLayer";
export default MetadataLayer;
