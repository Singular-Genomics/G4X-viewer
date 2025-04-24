import { PickingInfo } from '@deck.gl/core';
import { HeatmapRanges, ProteinNames } from '../../stores/CytometryGraphStore/CytometryGraphStore.types';

export type CellMasksLayerProps = CompositeLayerProps & {
  masksData: any[];
  showCellFill: boolean;
  showDiscardedPoints: boolean;
  cellFillOpacity: number;
  cellNameFilters: string[] | 'all';
  cellCytometryFilter: {
    proteins: ProteinNames;
    range?: HeatmapRanges;
  };
  onHover?: (pikingInfo: PickingInfo) => void;
};

type CompositeLayerProps = {
  id?: string;
  visible?: boolean;
  pickable?: boolean;
};
