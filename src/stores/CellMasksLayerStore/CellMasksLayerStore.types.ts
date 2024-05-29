export type CellMasksLayerStore = CellMasksLayerStoreValues & CellMasksLayerStoreMethods

export type CellMasksLayerStoreValues = {
  cellMasksData: Uint8Array | null;
  fileName: string;
  isCellLayerOn: boolean;
}

export type CellMasksLayerStoreMethods = {
  toggleCellLayer: () => void;
}