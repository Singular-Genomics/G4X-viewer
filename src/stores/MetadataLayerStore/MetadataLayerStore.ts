import { create } from "zustand";
import { MetadataLayerStore, MetadataLayerStoreValues } from "./MetadataLayerStore.types";

const DEFAULT_METADATA_LAYER_STORE_VALUES: MetadataLayerStoreValues = {
  isMetadataLayerOn: true,
  showTilesBoundries: false,
  showTilesData: false,
  pointSize: 1.5,
}

export const useMetadataLayerStore = create<MetadataLayerStore>((set) => ({
  ...DEFAULT_METADATA_LAYER_STORE_VALUES,
  toggleMetadataLayer: () => set((store) => ({isMetadataLayerOn: !store.isMetadataLayerOn})),
  toggleTileBoundries: () => set((store) => ({showTilesBoundries: !store.showTilesBoundries})),
  toggleTileData: () => set((store) => ({showTilesData: !store.showTilesData})),
  setPointSize: (newPointSize) => set({ pointSize: newPointSize }),
}))