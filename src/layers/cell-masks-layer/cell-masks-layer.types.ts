import { PickingInfo } from '@deck.gl/core';
import { ColormapEntry, SingleMask } from '../../shared/types';

export type CellMasksLayerProps = CompositeLayerProps & {
  cellsData: SingleMask[];
  showCellFill: boolean;
  showDiscardedPoints: boolean;
  cellFillOpacity: number;
  showBoundary: boolean;
  boundaryWidth: number;
  outlierCellsData?: SingleMask[];
  colormap: ColormapEntry[];
  onHover?: (pikingInfo: PickingInfo) => void;
};

type CompositeLayerProps = {
  id?: string;
  visible?: boolean;
  pickable?: boolean;
};
