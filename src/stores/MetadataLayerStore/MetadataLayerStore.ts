import { create } from "zustand";
import { MetadataLayerStore, MetadataLayerStoreValues } from "./MetadataLayerStore.types";

const DEFAULT_METADATA_LAYER_STORE_VALUES: MetadataLayerStoreValues = {
  isMetadataLayerOn: true,
  isGeneNameFilterActive: false,
  showFilteredPoints: false,
  showTilesBoundries: false,
  showTilesData: false,
  pointSize: 1.5,
  geneNameFilters: [],
}

export const useMetadataLayerStore = create<MetadataLayerStore>((set) => ({
  ...DEFAULT_METADATA_LAYER_STORE_VALUES,
  toggleMetadataLayer: () => set((store) => ({isMetadataLayerOn: !store.isMetadataLayerOn})),
  toggleTileBoundries: () => set((store) => ({showTilesBoundries: !store.showTilesBoundries})),
  toggleTileData: () => set((store) => ({showTilesData: !store.showTilesData})),
  toggleGeneNameFilter: () => set((store) => ({isGeneNameFilterActive: !store.isGeneNameFilterActive})),
  toggleShowFilteredPoints: () => set((store) => ({showFilteredPoints: !store.showFilteredPoints})),
  setPointSize: (newPointSize) => set({ pointSize: newPointSize }),
  setGeneNamesFilter: (geneNames) => set({geneNameFilters: geneNames}),
  clearGeneNameFilters: () => set({geneNameFilters: []}),
  reset: () => set({...DEFAULT_METADATA_LAYER_STORE_VALUES})
}))