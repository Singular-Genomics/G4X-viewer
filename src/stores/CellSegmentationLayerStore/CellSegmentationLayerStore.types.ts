export type CellSegmentationLayerStore = CellSegmentationLayerStoreValues &
  CellSegmentationLayerStoreMethods;

export type CellSegmentationLayerStoreValues = {
  cellMasksData: Uint8Array | null;
  fileName: string;
  isCellLayerOn: boolean;
  isCellStrokeOn: boolean;
  isCellFillOn: boolean;
  isCellNameFilterOn: boolean;
  showFilteredCells: boolean;
  cellStrokeWidth: number;
  cellFillOpacity: number;
  cellColormapConfig: CellSegmentationColormapEntry[];
  cellNameFilters: string[];
};

export type CellSegmentationLayerStoreMethods = {
  toggleCellLayer: () => void;
  toggleCellStroke: () => void;
  toggleCellFill: () => void;
  toggleCellNameFilter: () => void;
  toggleShowFilteredCells: () => void;
  setCellStrokeWidth: (newWidth: number) => void;
  setCellFillOpacity: (newOpacity: number) => void;
  setCellColormapConfig: (config: CellSegmentationColormapEntry[]) => void;
  setCellNameFilter: (cellName: string[]) => void;
  clearCellNameFilter: () => void;
  reset: () => void;
};

export type CellSegmentationColormapEntry = {
  cellName: string;
  color: number[];
};
