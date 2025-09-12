import { PickingInfo } from '@deck.gl/core';
import { HeatmapRanges, ProteinIndices } from '../../stores/CytometryGraphStore/CytometryGraphStore.types';
import { UmapRange } from '../../stores/UmapGraphStore/UmapGraphStore.types';
import { SingleMask } from '../../shared/types';

export type CellMasksLayerProps = CompositeLayerProps & {
  showCellFill: boolean;
  showDiscardedPoints: boolean;
  cellFillOpacity: number;
  cellNameFilters: string[] | 'all';
  cellCytometryFilter: {
    proteins: ProteinIndices;
    range?: HeatmapRanges;
  };
  umapFilter?: UmapRange;
  onHover?: (pikingInfo: PickingInfo) => void;
  preFilteredUnselectedCells?: SingleMask[];
  preFilteredOutlierCells?: SingleMask[];
};

type CompositeLayerProps = {
  id?: string;
  visible?: boolean;
  pickable?: boolean;
};
