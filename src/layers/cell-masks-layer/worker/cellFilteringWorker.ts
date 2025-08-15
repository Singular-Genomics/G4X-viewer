import type { CellFilteringWorkerMessage, CellFilteringWorkerResponse } from './cellFilteringWorker.types';
import { SingleMask } from '../../../shared/types';
import { partition } from 'lodash';

const filterCells = (
  cellsData: SingleMask[],
  cellNameFilters?: string[] | 'all',
  cytometryFilter?: {
    proteins: { xAxis?: string; yAxis?: string };
    range?: { xStart: number; xEnd: number; yStart: number; yEnd: number };
  },
  umapFilter?: { xStart: number; xEnd: number; yStart: number; yEnd: number }
) => {
  try {
    let filteredCellsData: SingleMask[] = [];
    let outlierCellsData: SingleMask[] = [];

    // Apply cell name filters first
    if (cellNameFilters === 'all') {
      filteredCellsData = cellsData;
    } else if (cellNameFilters && cellNameFilters.length > 0) {
      [filteredCellsData, outlierCellsData] = partition(cellsData, (data) => cellNameFilters.includes(data.clusterId));
    } else {
      filteredCellsData = cellsData;
    }

    // Apply cytometry filter
    if (cytometryFilter?.range && cytometryFilter.proteins.xAxis && cytometryFilter.proteins.yAxis) {
      filteredCellsData = filteredCellsData.filter(
        (cell) =>
          cell.proteins[cytometryFilter.proteins.xAxis as string] <= cytometryFilter.range!.xEnd &&
          cell.proteins[cytometryFilter.proteins.xAxis as string] >= cytometryFilter.range!.xStart &&
          cell.proteins[cytometryFilter.proteins.yAxis as string] >= cytometryFilter.range!.yEnd &&
          cell.proteins[cytometryFilter.proteins.yAxis as string] <= cytometryFilter.range!.yStart
      );
    }

    // Apply UMAP filter
    if (umapFilter) {
      filteredCellsData = filteredCellsData.filter(
        (cell) =>
          cell.umapValues.umapX >= umapFilter.xStart &&
          cell.umapValues.umapX <= umapFilter.xEnd &&
          cell.umapValues.umapY <= umapFilter.yStart &&
          cell.umapValues.umapY >= umapFilter.yEnd
      );
    }

    // Since we always pass empty selectedCellIds array, always return all cells as unselected
    return {
      selectedCellsData: [],
      unselectedCellsData: filteredCellsData,
      outlierCellsData
    };
  } catch (error) {
    throw new Error(`Error filtering cells: ${error}`);
  }
};

onmessage = async (e: MessageEvent<CellFilteringWorkerMessage>) => {
  const { type, payload } = e.data;

  try {
    if (type === 'filterCells') {
      const result = filterCells(
        payload.cellsData,
        payload.cellNameFilters,
        payload.cytometryFilter,
        payload.umapFilter
      );

      postMessage({
        type: 'cellsFiltered',
        payload: {
          success: true,
          ...result
        }
      } as CellFilteringWorkerResponse);
    }
  } catch (error) {
    postMessage({
      type: 'error',
      payload: {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    } as CellFilteringWorkerResponse);
  }
};
