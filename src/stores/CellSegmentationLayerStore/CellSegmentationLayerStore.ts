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
  showBoundary: false,
  boundaryWidth: 1,
  cellColormapConfig: [],
  cellNameFilters: [],
  selectedCells: [],
  umapDataAvailable: false,
  segmentationMetadata: undefined
};

export const useCellSegmentationLayerStore = create<CellSegmentationLayerStore>((set) => ({
  ...CELL_SEGMENTATION_STORE_DEFAULT_VALUES,
  toggleCellLayer: () => set((store) => ({ isCellLayerOn: !store.isCellLayerOn })),
  toggleCellFill: () => set((store) => ({ isCellFillOn: !store.isCellFillOn })),
  toggleCellNameFilter: () => set((store) => ({ isCellNameFilterOn: !store.isCellNameFilterOn })),
  toggleShowFilteredCells: () => set((store) => ({ showFilteredCells: !store.showFilteredCells })),
  setCellFillOpacity: (newOpacity) => set({ cellFillOpacity: newOpacity }),
  toggleBoundary: () => set((store) => ({ showBoundary: !store.showBoundary })),
  setBoundaryWidth: (width) => set({ boundaryWidth: width }),
  setCellColormapConfig: (config) => set({ cellColormapConfig: config }),
  setCellNameFilter: (cellNames) => set({ cellNameFilters: cellNames }),
  clearCellNameFilter: () => set({ cellNameFilters: [] }),
  setSelectedCells: (selectionData) => set({ selectedCells: selectionData }),
  addSelectedCells: (newSelectionData) =>
    set((store) => ({ selectedCells: [...store.selectedCells, newSelectionData] })),
  updateSelectedCells: (updatedData, selectionId) =>
    set((store) => ({
      selectedCells: store.selectedCells.map((selection) => {
        if (selection.roiId !== selectionId) {
          return selection;
        }
        return {
          ...selection,
          data: updatedData
        };
      })
    })),
  deleteSelectedCells: (selectionId) =>
    set((store) => ({ selectedCells: store.selectedCells.filter((selection) => selection.roiId !== selectionId) })),
  reset: () => set({ ...CELL_SEGMENTATION_STORE_DEFAULT_VALUES })
}));
