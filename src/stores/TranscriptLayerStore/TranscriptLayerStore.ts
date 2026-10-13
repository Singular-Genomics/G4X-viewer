import { create } from 'zustand';
import { TranscriptLayerStore, TranscriptLayerStoreValues } from './TranscriptLayerStore.types';

// Per call, so each store gets its own geneNameFilters Set
const createDefaultTranscriptLayerStoreValues = (): TranscriptLayerStoreValues => ({
  isTranscriptLayerOn: false,
  isGeneNameFilterActive: false,
  showFilteredPoints: false,
  showTilesBoundries: false,
  showTilesData: false,
  showPointOutline: false,
  overrideLayers: false,
  pointSize: 1.5,
  geneNameFilters: new Set<string>(),
  maxVisibleLayers: null,
  currentVisibleLayer: 0,
  selectedPoints: []
});

// Shared by transcripts and Direct-Seq, where isTranscriptLayerOn etc. mean "this layer"
export const createTranscriptLayerStore = () =>
  create<TranscriptLayerStore>((set) => ({
    ...createDefaultTranscriptLayerStoreValues(),
    toggleTranscriptLayer: () => set((store) => ({ isTranscriptLayerOn: !store.isTranscriptLayerOn })),
    toggleTileBoundries: () => set((store) => ({ showTilesBoundries: !store.showTilesBoundries })),
    toggleTileData: () => set((store) => ({ showTilesData: !store.showTilesData })),
    togglePointOutline: () => set((store) => ({ showPointOutline: !store.showPointOutline })),
    toggleGeneNameFilter: () => set((store) => ({ isGeneNameFilterActive: !store.isGeneNameFilterActive })),
    toggleShowFilteredPoints: () => set((store) => ({ showFilteredPoints: !store.showFilteredPoints })),
    toggleOverrideLayer: () => set((store) => ({ overrideLayers: !store.overrideLayers })),
    setPointSize: (newPointSize) => set({ pointSize: newPointSize }),
    setGeneNamesFilter: (geneNames) => set({ geneNameFilters: geneNames }),
    clearGeneNameFilters: () => set({ geneNameFilters: new Set<string>() }),
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
    reset: () => set({ ...createDefaultTranscriptLayerStoreValues() })
  }));

export const useTranscriptLayerStore = createTranscriptLayerStore();
