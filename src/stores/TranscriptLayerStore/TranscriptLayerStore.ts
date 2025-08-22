import { create } from 'zustand';
import { TranscriptLayerStore, TranscriptLayerStoreValues } from './TranscriptLayerStore.types';

const DEFAULT_TRANSCRIPT_LAYER_STORE_VALUES: TranscriptLayerStoreValues = {
  isTranscriptLayerOn: true,
  isGeneNameFilterActive: false,
  showFilteredPoints: false,
  showTilesBoundries: false,
  showTilesData: false,
  overrideLayers: false,
  pointSize: 1.5,
  geneNameFilters: [],
  maxVisibleLayers: 0,
  selectedPoints: []
};

export const useTranscriptLayerStore = create<TranscriptLayerStore>((set) => ({
  ...DEFAULT_TRANSCRIPT_LAYER_STORE_VALUES,
  toggleTranscriptLayer: () => set((store) => ({ isTranscriptLayerOn: !store.isTranscriptLayerOn })),
  toggleTileBoundries: () => set((store) => ({ showTilesBoundries: !store.showTilesBoundries })),
  toggleTileData: () => set((store) => ({ showTilesData: !store.showTilesData })),
  toggleGeneNameFilter: () => set((store) => ({ isGeneNameFilterActive: !store.isGeneNameFilterActive })),
  toggleShowFilteredPoints: () => set((store) => ({ showFilteredPoints: !store.showFilteredPoints })),
  toggleOverrideLayer: () => set((store) => ({ overrideLayers: !store.overrideLayers })),
  setPointSize: (newPointSize) => set({ pointSize: newPointSize }),
  setGeneNamesFilter: (geneNames) => set({ geneNameFilters: geneNames }),
  clearGeneNameFilters: () => set({ geneNameFilters: [] }),
  setSelectedPoints: (selectionData) => set({ selectedPoints: selectionData }),
  addSelectedPoints: (newSelectionData) =>
    set((store) => ({ selectedPoints: [...store.selectedPoints, newSelectionData] })),
  updateSelectedPoints: (updatedData, selectionId) =>
    set((store) => ({
      selectedPoints: store.selectedPoints.map((selection) => {
        if (selection.roiId !== selectionId) {
          return selection;
        }
        return {
          ...selection,
          data: updatedData
        };
      })
    })),
  deleteSelectedPoints: (selectionId) =>
    set((store) => ({ selectedPoints: store.selectedPoints.filter((selection) => selection.roiId !== selectionId) })),
  reset: () => set({ ...DEFAULT_TRANSCRIPT_LAYER_STORE_VALUES })
}));
