import { PickingInfo } from '@deck.gl/core';

export type CellMasksLayerProps = CompositeLayerProps & {
  masksData: any[];
  showCellFill: boolean;
  showDiscardedPoints: boolean;
  cellFillOpacity: number;
  cellFilters: string[] | 'all';
  onHover?: (pikingInfo: PickingInfo) => void;
};

type CompositeLayerProps = {
  id?: string;
  visible?: boolean;
  pickable?: boolean;
};
