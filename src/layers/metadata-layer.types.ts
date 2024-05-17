import { LayerConfig } from "../stores/BinaryFilesStore";

export type SingleTileLayerProps = CompositeLayerProps & {
  layerData: LayerDataItem[];
  pointSize: number;
};

export type LayerDataItem = {
  index: LayerDataIndex;
  textPosition: { x: number; y: number };
  points: any[];
  tileData: { width: number; height: number };
  boundingBox: number[];
};

export type MetadataLayerProps = CompositeLayerProps & {
  protoRoot?: protobuf.Root;
  files: File[];
  config: LayerConfig;
  pointSize: number;
};

export type getTileDataProps = {
  index: LayerDataIndex;
  bbox: any;
};

type CompositeLayerProps = {
  id?: string;
  visible?: boolean;
  pickable?: boolean;
};

type LayerDataIndex = { x: number; y: number; z: number };
