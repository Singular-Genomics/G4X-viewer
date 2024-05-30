import { create } from "zustand";
import { CellMasksLayerStore, CellMasksLayerStoreValues } from "./CellMasksLayerStore.types";

const CELL_MASKS_STORE_DEFAULT_VALUES: CellMasksLayerStoreValues = {
  cellMasksData: null,
  fileName: '',
  isCellLayerOn: true,
  isCellFillOn: true,
  isCellStrokeOn: true,
  cellStrokeWidth: 5,
  cellFillOpacity: 0.2,
}

export const useCellMasksLayerStore = create<CellMasksLayerStore>((set) => ({
  ...CELL_MASKS_STORE_DEFAULT_VALUES,
  toggleCellLayer: () => set((store) => ({isCellLayerOn: !store.isCellLayerOn})),
  toggleCellFill: () => set((store) => ({isCellFillOn: !store.isCellFillOn})),
  toggleCellStroke: () => set((store) => ({isCellStrokeOn: !store.isCellStrokeOn})),
  setCellStrokeWidth: (newWidth) => set({cellStrokeWidth: newWidth}),
  setCellFillOpacity: (newOpacity) => set({cellFillOpacity: newOpacity}),
}))