import { create } from "zustand";
import {
  CellSegmentationLayerStore,
  CellSegmentationLayerStoreValues,
} from "./CellSegmentationLayerStore.types";

const CELL_SEGMENTATION_STORE_DEFAULT_VALUES: CellSegmentationLayerStoreValues =
  {
    cellMasksData: null,
    fileName: "",
    isCellLayerOn: true,
    isCellFillOn: true,
    isCellStrokeOn: true,
    isCellNameFilterOn: false,
    showFilteredCells: false,
    cellStrokeWidth: 5,
    cellFillOpacity: 0.2,
    cellColormapConfig: [],
    cellNameFilters: [],
  };

export const useCellSegmentationLayerStore = create<CellSegmentationLayerStore>(
  (set) => ({
    ...CELL_SEGMENTATION_STORE_DEFAULT_VALUES,
    toggleCellLayer: () =>
      set((store) => ({ isCellLayerOn: !store.isCellLayerOn })),
    toggleCellFill: () =>
      set((store) => ({ isCellFillOn: !store.isCellFillOn })),
    toggleCellStroke: () =>
      set((store) => ({ isCellStrokeOn: !store.isCellStrokeOn })),
    toggleCellNameFilter: () =>
      set((store) => ({ isCellNameFilterOn: !store.isCellNameFilterOn })),
    toggleShowFilteredCells: () =>
      set((store) => ({ showFilteredCells: !store.showFilteredCells })),
    setCellStrokeWidth: (newWidth) => set({ cellStrokeWidth: newWidth }),
    setCellFillOpacity: (newOpacity) => set({ cellFillOpacity: newOpacity }),
    setCellColormapConfig: (config) => set({ cellColormapConfig: config }),
    setCellNameFilter: (cellNames) => set({ cellNameFilters: cellNames }),
    clearCellNameFilter: () => set({ cellNameFilters: [] }),
  })
);
