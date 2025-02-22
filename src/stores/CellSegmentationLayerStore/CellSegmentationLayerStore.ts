import { create } from 'zustand';
import { CellSegmentationLayerStore, CellSegmentationLayerStoreValues } from './CellSegmentationLayerStore.types';

const CELL_SEGMENTATION_STORE_DEFAULT_VALUES: CellSegmentationLayerStoreValues = {
  cellMasksData: null,
  fileName: '',
  isCellLayerOn: true,
  isCellFillOn: true,
  isCellNameFilterOn: false,
  showFilteredCells: false,
  cellFillOpacity: 0.2,
  cellColormapConfig: [],
  cellNameFilters: []
};

export const useCellSegmentationLayerStore = create<CellSegmentationLayerStore>((set) => ({
  ...CELL_SEGMENTATION_STORE_DEFAULT_VALUES,
  toggleCellLayer: () => set((store) => ({ isCellLayerOn: !store.isCellLayerOn })),
  toggleCellFill: () => set((store) => ({ isCellFillOn: !store.isCellFillOn })),
  toggleCellNameFilter: () => set((store) => ({ isCellNameFilterOn: !store.isCellNameFilterOn })),
  toggleShowFilteredCells: () => set((store) => ({ showFilteredCells: !store.showFilteredCells })),
  setCellFillOpacity: (newOpacity) => set({ cellFillOpacity: newOpacity }),
  setCellColormapConfig: (config) => set({ cellColormapConfig: config }),
  setCellNameFilter: (cellNames) => set({ cellNameFilters: cellNames }),
  clearCellNameFilter: () => set({ cellNameFilters: [] }),
  reset: () => set({ ...CELL_SEGMENTATION_STORE_DEFAULT_VALUES })
}));
