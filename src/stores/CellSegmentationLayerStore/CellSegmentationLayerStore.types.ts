import { SingleMask } from '../../shared/types';

export type CellSegmentationLayerStore = CellSegmentationLayerStoreValues & CellSegmentationLayerStoreMethods;

export type CellSegmentationLayerStoreValues = {
  cellMasksData: SingleMask[] | null;
  fileName: string;
  isCellLayerOn: boolean;
  isCellFillOn: boolean;
  isCellNameFilterOn: boolean;
  showFilteredCells: boolean;
  cellFillOpacity: number;
  cellColormapConfig: CellSegmentationColormapEntry[];
  cellNameFilters: string[];
  selectedCells: any[];
  cytometryProteinsNames: string[];
  umapDataAvailable: boolean;
};

export type CellSegmentationLayerStoreMethods = {
  toggleCellLayer: () => void;
  toggleCellFill: () => void;
  toggleCellNameFilter: () => void;
  toggleShowFilteredCells: () => void;
  setCellFillOpacity: (newOpacity: number) => void;
  setCellColormapConfig: (config: CellSegmentationColormapEntry[]) => void;
  setCellNameFilter: (cellName: string[]) => void;
  clearCellNameFilter: () => void;
  setSelectedCells: (cells: any[]) => void;
  reset: () => void;
};

export type CellSegmentationColormapEntry = {
  clusterId: string;
  color: number[];
};
