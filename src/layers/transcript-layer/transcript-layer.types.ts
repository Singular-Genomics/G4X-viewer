import { PickingInfo } from '@deck.gl/core';
import { LayerConfig, type ColorMapEntry } from '../../stores/BinaryFilesStore';
import { GeneNameFilterType } from '../../stores/TranscriptLayerStore';
import { PointData } from '../../shared/types';

export type SingleTileLayerProps = CompositeLayerProps & {
  layerData: LayerDataItem[];
  pointSize: number;
  showBoundries: boolean;
  showData: boolean;
  showDiscardedPoints: boolean;
  disabledTiledView: boolean;
};

export type LayerDataItem = {
  index: LayerDataIndex;
  textPosition: { x: number; y: number };
  points: PointData[];
  outlierPoints: PointData[];
  tileData: { width: number; height: number };
  boundingBox: number[];
};

export type TranscriptLayerProps = CompositeLayerProps & {
  protoRoot?: protobuf.Root;
  files: File[];
  config: LayerConfig;
  colorMapConfig: ColorMapEntry[];
  geneFilters: GeneNameFilterType | 'all';
  pointSize: number;
  showTilesBoundries: boolean;
  showTilesData: boolean;
  showDiscardedPoints: boolean;
  overrideLayers: boolean;
  maxVisibleLayers: number;
  onHover?: (pikingInfo: PickingInfo) => void;
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
