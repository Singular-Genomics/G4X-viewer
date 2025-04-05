import { create } from 'zustand';
import { BrightfieldImagesStore, BrightfieldImagesStoreValues } from './BrightfieldImagesStore.types';

export const MAX_NUMBER_OF_IMAGES = 10;

const DEFAULT_VALUES: BrightfieldImagesStoreValues = {
  brightfieldImageSource: null,
  loader: [{ labels: [], shape: [] }],
  image: 0,
  contrastLimits: [[0, 65535]],
  selections: [{ z: 0, c: 0, t: 0 }],
  opacity: 1,
  isImageLoading: false,
  isLayerVisible: true,
  availableImages: []
};

export const useBrightfieldImagesStore = create<BrightfieldImagesStore>((set, get) => ({
  ...DEFAULT_VALUES,
  reset: () => set({ ...DEFAULT_VALUES }),
  getLoader: () => {
    const { loader, image } = get();
    return Array.isArray(loader[0]) ? loader[image] : loader;
  },
  toggleImageLayer: () => set((store) => ({ isLayerVisible: !store.isLayerVisible })),
  setActiveImage: (file: File | null) =>
    set({
      brightfieldImageSource: file
        ? {
            description: file.name,
            urlOrFile: file
          }
        : null
    }),
  setAvailableImages: (files: File[]) => set({ availableImages: files }),
  addNewFile: (file: File) =>
    set((state) => {
      const newImagesList = state.availableImages;
      newImagesList.push(file);
      return {
        ...state,
        availableImages: newImagesList
      };
    }),
  removeFileByName: (fileName: string) =>
    set((state) => {
      const newImagesList = state.availableImages;
      const index = newImagesList.findIndex((entry) => entry.name === fileName);
      if (index !== -1) {
        if (newImagesList.length === 1) {
          newImagesList.pop();
        } else {
          newImagesList.splice(index, 1);
        }
      }

      return {
        ...state,
        availableImages: newImagesList
      };
    })
}));
