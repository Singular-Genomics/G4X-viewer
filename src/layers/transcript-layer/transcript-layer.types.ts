import { PickingInfo } from '@deck.gl/core';
import { LayerConfig } from '../../stores/BinaryFilesStore';
import { GeneNameFilterType } from '../../stores/TranscriptLayerStore';

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
  points: any[];
  outlierPoints: any[];
  tileData: { width: number; height: number };
  boundingBox: number[];
};

export type TranscriptLayerProps = CompositeLayerProps & {
  protoRoot?: protobuf.Root;
  files: File[];
  config: LayerConfig;
  geneFilters: GeneNameFilterType | 'all';
  pointSize: number;
  showTilesBoundries: boolean;
  showTilesData: boolean;
  showDiscardedPoints: boolean;
  overrideLayers: boolean;
  maxVisibleLayers: number;
  currentZoom: number;
  onHover?: (pikingInfo: PickingInfo) => void;
  onLayerUpdate?: (index: { x: number; y: number; z: number }, currentZoom: number) => void;
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
