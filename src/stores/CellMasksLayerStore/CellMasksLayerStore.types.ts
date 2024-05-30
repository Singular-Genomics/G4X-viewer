export type CellMasksLayerStore = CellMasksLayerStoreValues & CellMasksLayerStoreMethods

export type CellMasksLayerStoreValues = {
  cellMasksData: Uint8Array | null;
  fileName: string;
  isCellLayerOn: boolean;
  isCellStrokeOn: boolean;
  isCellFillOn: boolean;
  cellStrokeWidth: number;
  cellFillOpacity: number;
}

export type CellMasksLayerStoreMethods = {
  toggleCellLayer: () => void;
  toggleCellStroke: () => void;
  toggleCellFill: () => void;
  setCellStrokeWidth: (newWidth: number) => void;
  setCellFillOpacity: (newOpacity: number) => void;
}