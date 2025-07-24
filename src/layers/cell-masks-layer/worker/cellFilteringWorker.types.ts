import { SingleMask } from '../../../shared/types';
import { HeatmapRanges, ProteinNames } from '../../../stores/CytometryGraphStore/CytometryGraphStore.types';
import { UmapRange } from '../../../stores/UmapGraphStore/UmapGraphStore.types';

export type CellFilteringWorkerMessage = {
  type: 'filterCells';
  payload: {
    cellsData: SingleMask[];
    selectedCellIds: string[];
    cellNameFilters?: string[] | 'all';
    cytometryFilter?: {
      proteins: ProteinNames;
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
