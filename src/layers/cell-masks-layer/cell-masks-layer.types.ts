import { PickingInfo } from '@deck.gl/core';
import { HeatmapRanges, ProteinNames } from '../../stores/CytometryGraphStore/CytometryGraphStore.types';
import { UmapRange } from '../../stores/UmapGraphStore/UmapGraphStore.types';
import { SingleMask } from '../../shared/types';

export type CellMasksLayerProps = CompositeLayerProps & {
  masksData: SingleMask[];
  showCellFill: boolean;
  showDiscardedPoints: boolean;
  cellFillOpacity: number;
  cellNameFilters: string[] | 'all';
  cellCytometryFilter: {
    proteins: ProteinNames;
    range?: HeatmapRanges;
  };
  umapFilter?: UmapRange;
  onHover?: (pikingInfo: PickingInfo) => void;
};

type CompositeLayerProps = {
  id?: string;
  visible?: boolean;
  pickable?: boolean;
};
