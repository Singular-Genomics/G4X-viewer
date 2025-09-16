import { PickingInfo } from '@deck.gl/core';
import { SingleMask } from '../../shared/types';

export type CellMasksLayerProps = CompositeLayerProps & {
  cellsData: SingleMask[];
  showCellFill: boolean;
  showDiscardedPoints: boolean;
  cellFillOpacity: number;
  outlierCellsData?: SingleMask[];
  onHover?: (pikingInfo: PickingInfo) => void;
};

type CompositeLayerProps = {
  id?: string;
  visible?: boolean;
  pickable?: boolean;
};
