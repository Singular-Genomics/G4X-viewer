import { create } from "zustand";
import { CellMasksLayerStore, CellMasksLayerStoreValues } from "./CellMasksLayerStore.types";

const CELL_MASKS_STORE_DEFAULT_VALUES: CellMasksLayerStoreValues = {
  cellMasksData: null,
  fileName: '',
  isCellLayerOn: true,
}

export const useCellMasksLayerStore = create<CellMasksLayerStore>((set) => ({
  ...CELL_MASKS_STORE_DEFAULT_VALUES,
  toggleCellLayer: () => set((store) => ({isCellLayerOn: !store.isCellLayerOn})),
}))