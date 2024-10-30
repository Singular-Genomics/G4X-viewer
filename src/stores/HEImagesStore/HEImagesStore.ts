import { create } from "zustand";
import { HEImagesStore, HEImagesStoreValues } from "./HEImagesStore.types";

const DEFAULT_VALUES: HEImagesStoreValues = {
  heImageSource: null,
  loader: [{ labels: [], shape: [] }],
  image: 0,
  contrastLimits: [[0, 65535]],
  selections: [{ z: 0, c: 0, t: 0 }],
  opacity: 1,
  isImageLoading: false,
  isLayerVisible: true,
};

export const useHEImagesStore = create<HEImagesStore>((set, get) => ({
  ...DEFAULT_VALUES,
  reset: () => set({ ...DEFAULT_VALUES }),
  getLoader: () => {
    const { loader, image } = get();
    return Array.isArray(loader[0]) ? loader[image] : loader;
  },
  toggleImageLayer: () =>
    set((store) => ({ isLayerVisible: !store.isLayerVisible })),
}));
