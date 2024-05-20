import { LayerConfig } from "../stores/BinaryFilesStore";
import { GeneNameFilterType } from "../stores/MetadataLayerStore";

export type SingleTileLayerProps = CompositeLayerProps & {
  layerData: LayerDataItem[];
  pointSize: number;
  showBoundries: boolean;
  showData: boolean;
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
  geneFilters: GeneNameFilterType;
  pointSize: number;
  showTilesBoundries: boolean;
  showTilesData: boolean;
  showDiscardedPoints: boolean;
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
