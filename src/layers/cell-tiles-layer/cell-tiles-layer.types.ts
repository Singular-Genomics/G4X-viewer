import { PickingInfo } from '@deck.gl/core';
import { ColormapEntry, SingleMask } from '../../shared/types';
import { ZarrLayerConfig } from '../../utils/ZarrDataSet.types';

export type CellTilesLayerProps = CompositeLayerProps & {
  zarrUrl: string;
  segmentationFolder: string;
  cellsLayerConfig: ZarrLayerConfig;
  clusterLabelIndex: number;
  colormap: ColormapEntry[];
  cellFillOpacity: number;
  showCellFill: boolean;
  showBoundary: boolean;
  boundaryWidth: number;
  onHover?: (pickingInfo: PickingInfo) => void;
  onLoadingStateChange?: (isLoading: boolean) => void;
};

export type CellTilesSubLayerData = {
  polygons: SingleMask[];
};

export type CellTilesSubLayerProps = CompositeLayerProps & {
  tileData: CellTilesSubLayerData[];
  parsedColorMap: Record<string, number[]>;
  cellFillOpacity: number;
  showCellFill: boolean;
  showBoundary: boolean;
  boundaryWidth: number;
};

type CompositeLayerProps = {
  id?: string;
  visible?: boolean;
  pickable?: boolean;
};

export type GetCellTileDataProps = {
  index: { x: number; y: number; z: number };
  bbox: any;
};
