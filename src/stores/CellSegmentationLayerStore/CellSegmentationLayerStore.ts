import { create } from 'zustand';
import { CellSegmentationLayerStore, CellSegmentationLayerStoreValues } from './CellSegmentationLayerStore.types';

const CELL_SEGMENTATION_STORE_DEFAULT_VALUES: CellSegmentationLayerStoreValues = {
  cellMasksData: null,
  fileName: '',
  isCellLayerOn: false,
  isCellNameFilterOn: false,
  showFilteredCells: false,
  cellFillOpacity: 0.2,
  showBoundary: false,
  boundaryWidth: 1,
  cellColormapConfig: [],
  cellNameFilters: new Set<string>(),
  clusterLabelFilters: {},
  selectedCells: [],
  umapDataAvailable: false,
  segmentationMetadata: undefined,
  availableSegmentations: [],
  selectedSegmentationLabel: '',
  availableClusterLabels: [],
  selectedClusterLabelKey: ''
};

// Save the outgoing label's applied filters and restore only the incoming label's state.
export const getClusterLabelFilterState = (store: CellSegmentationLayerStoreValues, key: string) => {
  const clusterLabelFilters = {
    ...store.clusterLabelFilters,
    [store.selectedClusterLabelKey]: {
      cellNameFilters: store.cellNameFilters,
      isCellNameFilterOn: store.isCellNameFilterOn,
      showFilteredCells: store.showFilteredCells
    }
  };

  return {
    selectedClusterLabelKey: key,
    clusterLabelFilters,
    ...(clusterLabelFilters[key] ?? {
      cellNameFilters: new Set<string>(),
      isCellNameFilterOn: false,
      showFilteredCells: false
    })
  };
};

export const useCellSegmentationLayerStore = create<CellSegmentationLayerStore>((set) => ({
  ...CELL_SEGMENTATION_STORE_DEFAULT_VALUES,
  toggleCellLayer: () => set((store) => ({ isCellLayerOn: !store.isCellLayerOn })),
  toggleCellNameFilter: () => set((store) => ({ isCellNameFilterOn: !store.isCellNameFilterOn })),
  toggleShowFilteredCells: () => set((store) => ({ showFilteredCells: !store.showFilteredCells })),
  setCellFillOpacity: (newOpacity) => set({ cellFillOpacity: newOpacity }),
  toggleBoundary: () => set((store) => ({ showBoundary: !store.showBoundary })),
  setBoundaryWidth: (width) => set({ boundaryWidth: width }),
  setCellColormapConfig: (config) => set({ cellColormapConfig: config }),
  setCellNameFilter: (cellNames) => set({ cellNameFilters: cellNames }),
  clearCellNameFilter: () => set({ cellNameFilters: new Set<string>() }),
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
  setSelectedSegmentationLabel: (label) => set({ selectedSegmentationLabel: label }),
  setSelectedClusterLabelKey: (key) => set((store) => getClusterLabelFilterState(store, key)),
  reset: () => set({ ...CELL_SEGMENTATION_STORE_DEFAULT_VALUES })
}));
