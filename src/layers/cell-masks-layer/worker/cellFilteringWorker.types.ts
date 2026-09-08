import { SingleMask } from '../../../shared/types';
import { CellNameFilterType } from '../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore.types';
import { HeatmapRanges, ProteinIndices } from '../../../stores/CytometryGraphStore/CytometryGraphStore.types';
import { UmapRange } from '../../../stores/UmapGraphStore/UmapGraphStore.types';

export type CellFilteringWorkerMessage = {
  type: 'filterCells';
  payload: {
    cellsData: SingleMask[];
    cellNameFilters?: CellNameFilterType | 'all';
    cytometryFilter?: {
      proteins: ProteinIndices;
      range?: HeatmapRanges;
    };
    umapFilter?: UmapRange;
  };
};

export type CellFilteringWorkerResponse =
  | {
      type: 'cellsFiltered';
      payload: {
        success: true;
        selectedCellsData: SingleMask[];
        unselectedCellsData: SingleMask[];
        outlierCellsData: SingleMask[];
      };
    }
  | {
      type: 'error';
      payload: {
        success: false;
        error: string;
      };
    };
