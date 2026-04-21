import { PickingInfo } from '@deck.gl/core';
import { ColormapEntry, SingleMask } from '../../shared/types';

export type CellMasksLayerProps = CompositeLayerProps & {
  cellMasksData: SingleMask[];
  filterValues: Uint8Array;
  showCellFill: boolean;
  showDiscardedPoints: boolean;
  cellFillOpacity: number;
  showBoundary: boolean;
  boundaryWidth: number;
  colormap: ColormapEntry[];
  onHover?: (pikingInfo: PickingInfo) => void;
};

type CompositeLayerProps = {
  id?: string;
  visible?: boolean;
  pickable?: boolean;
};
