import { SingleMask } from '../../shared/types';
import { SelectionData } from '../PolygonDrawingStore';

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
  selectedCells: SelectionData<SingleMask>[];
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
  setSelectedCells: (selectionData: SelectionData<SingleMask>[]) => void;
  addSelectedCells: (newSelectionData: SelectionData<SingleMask>) => void;
  updateSelectedCells: (updatedData: SingleMask[], selectionId: number) => void;
  deleteSelectedCells: (selectionId: number) => void;
  reset: () => void;
};

export type CellSegmentationColormapEntry = {
  clusterId: string;
  color: number[];
};
