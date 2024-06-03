export type CellMasksLayerStore = CellMasksLayerStoreValues & CellMasksLayerStoreMethods

export type CellMasksLayerStoreValues = {
  cellMasksData: Uint8Array | null;
  fileName: string;
  isCellLayerOn: boolean;
  isCellStrokeOn: boolean;
  isCellFillOn: boolean;
  isCellNameFilterOn: boolean;
  showFilteredCells: boolean;
  cellStrokeWidth: number;
  cellFillOpacity: number;
  cellColormapConfig: CellMasksColormapEntry[];
  cellNameFilters: string[];
}

export type CellMasksLayerStoreMethods = {
  toggleCellLayer: () => void;
  toggleCellStroke: () => void;
  toggleCellFill: () => void;
  toggleCellNameFilter: () => void;
  toggleShowFilteredCells: () => void;
  setCellStrokeWidth: (newWidth: number) => void;
  setCellFillOpacity: (newOpacity: number) => void;
  setCellColormapConfig: (config: CellMasksColormapEntry[]) => void;
  setCellNameFilter: (cellName: string[]) => void;
  clearCellNameFilter: () => void;
}

export type CellMasksColormapEntry = {
  cellName: string;
  color: number[];
}