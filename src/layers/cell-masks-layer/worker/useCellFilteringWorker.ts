import { useCallback, useRef } from 'react';
import type { CellFilteringWorkerMessage, CellFilteringWorkerResponse } from './cellFilteringWorker.types';
import { SingleMask } from '../../../shared/types';
import { HeatmapRanges, ProteinNames } from '../../../stores/CytometryGraphStore/CytometryGraphStore.types';
import { UmapRange } from '../../../stores/UmapGraphStore/UmapGraphStore.types';

export type CellFilteringWorkerHook = {
  filterCells: (
    cellsData: SingleMask[],
    cellNameFilters?: string[] | 'all',
    cytometryFilter?: {
      proteins: ProteinNames;
      range?: HeatmapRanges;
    },
    umapFilter?: UmapRange
  ) => Promise<{
    selectedCellsData: SingleMask[];
    unselectedCellsData: SingleMask[];
    outlierCellsData: SingleMask[];
  }>;
  terminateWorker: () => void;
};

export const useCellFilteringWorker = (): CellFilteringWorkerHook => {
  const workerRef = useRef<Worker | null>(null);

  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(new URL('./cellFilteringWorker.ts', import.meta.url), { type: 'module' });
    }
    return workerRef.current;
  }, []);

  const filterCells = useCallback(
    (
      cellsData: SingleMask[],
      cellNameFilters?: string[] | 'all',
      cytometryFilter?: {
        proteins: ProteinNames;
        range?: HeatmapRanges;
      },
      umapFilter?: UmapRange
    ) => {
      return new Promise<{
        selectedCellsData: SingleMask[];
        unselectedCellsData: SingleMask[];
        outlierCellsData: SingleMask[];
      }>((resolve, reject) => {
        const worker = getWorker();

        const handleMessage = (e: MessageEvent<CellFilteringWorkerResponse>) => {
          const { type, payload } = e.data;

          if (type === 'cellsFiltered') {
            worker.removeEventListener('message', handleMessage);
            if (payload.success) {
              resolve({
                selectedCellsData: payload.selectedCellsData,
                unselectedCellsData: payload.unselectedCellsData,
                outlierCellsData: payload.outlierCellsData
              });
            }
          } else if (type === 'error') {
            worker.removeEventListener('message', handleMessage);
            reject(new Error(payload.error));
          }
        };

        worker.addEventListener('message', handleMessage);

        const message: CellFilteringWorkerMessage = {
          type: 'filterCells',
          payload: {
            cellsData,
            cellNameFilters,
            cytometryFilter,
            umapFilter
          }
        };

        worker.postMessage(message);
      });
    },
    [getWorker]
  );

  const terminateWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  return {
    filterCells,
    terminateWorker
  };
};
