import { create } from 'zustand';
import { TranscriptLayerStore, TranscriptLayerStoreValues, TileZoomBreakpoint } from './TranscriptLayerStore.types';

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
  currentVisibleLayer: 0,
  tileZoomBreakpoints: []
};

export const useTranscriptLayerStore = create<TranscriptLayerStore>((set, get) => ({
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

  updateTileZoomBreakpoint: (tileIndex: number, currentZoom: number) => {
    if (typeof tileIndex !== 'number' || typeof currentZoom !== 'number' || isNaN(tileIndex) || isNaN(currentZoom)) {
      return;
    }

    const state = get();
    const breakpoints = state.tileZoomBreakpoints;

    const existingIndex = breakpoints.findIndex((bp) => bp.tileIndex === tileIndex);

    let updatedBreakpoints: TileZoomBreakpoint[];

    if (existingIndex !== -1) {
      if (breakpoints[existingIndex].zoomThreshold === currentZoom) {
        return;
      }
      updatedBreakpoints = [...breakpoints];
      updatedBreakpoints[existingIndex] = { ...updatedBreakpoints[existingIndex], zoomThreshold: currentZoom };
    } else {
      updatedBreakpoints = [...breakpoints, { tileIndex, zoomThreshold: currentZoom }];
    }

    updatedBreakpoints.sort((a, b) => b.zoomThreshold - a.zoomThreshold);

    set({
      tileZoomBreakpoints: updatedBreakpoints,
      currentVisibleLayer: tileIndex
    });
  },

  getCurrentTileIndexForZoom: (zoom: number): number => {
    const { tileZoomBreakpoints, currentVisibleLayer } = get();

    if (typeof zoom !== 'number' || isNaN(zoom)) {
      return currentVisibleLayer || 0;
    }

    if (tileZoomBreakpoints.length === 0) {
      return currentVisibleLayer || 0;
    }

    for (const breakpoint of tileZoomBreakpoints) {
      if (breakpoint && typeof breakpoint.tileIndex === 'number' && zoom >= breakpoint.zoomThreshold) {
        return breakpoint.tileIndex;
      }
    }

    const lastBreakpoint = tileZoomBreakpoints[tileZoomBreakpoints.length - 1];
    return lastBreakpoint && typeof lastBreakpoint.tileIndex === 'number'
      ? lastBreakpoint.tileIndex
      : currentVisibleLayer || 0;
  },

  reset: () => set({ ...DEFAULT_TRANSCRIPT_LAYER_STORE_VALUES })
}));
