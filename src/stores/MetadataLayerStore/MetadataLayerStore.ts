import { create } from "zustand";
import { MetadataLayerStore, MetadataLayerStoreValues } from "./MetadataLayerStore.types";

const DEFAULT_METADATA_LAYER_STORE_VALUES: MetadataLayerStoreValues = {
  isMetadataLayerOn: true,
  pointSize: 1.5,
}

export const useMetadataLayerStore = create<MetadataLayerStore>((set) => ({
  ...DEFAULT_METADATA_LAYER_STORE_VALUES,
  toggleMetadataLayer: () => set((store) => ({isMetadataLayerOn: !store.isMetadataLayerOn})),
  setPointSize: (newPointSize) => set({ pointSize: newPointSize }),
}))