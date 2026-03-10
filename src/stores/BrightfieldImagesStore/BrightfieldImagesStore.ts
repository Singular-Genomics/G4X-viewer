import { create } from 'zustand';
import { BrightfieldImagesStore, BrightfieldImagesStoreValues } from './BrightfieldImagesStore.types';
import { MAX_UINT16_VALUE } from '../../shared/constants';

export const MAX_NUMBER_OF_IMAGES = 10;

const DEFAULT_VALUES: BrightfieldImagesStoreValues = {
  brightfieldImageSource: null,
  loader: [{ labels: [], shape: [] }],
  image: 0,
  contrastLimits: [[0, MAX_UINT16_VALUE]],
  colors: [
    [255, 0, 0],
    [0, 255, 0],
    [0, 0, 255]
  ],
  selections: [{ z: 0, c: 0, t: 0 }],
  opacity: 1,
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
  setActiveImage: (file: File | string | null) => {
    if (file === null) {
      set({
        brightfieldImageSource: null,
        loader: DEFAULT_VALUES.loader
      });
      return;
    }

    set({
      brightfieldImageSource: {
        description: typeof file === 'string' ? file.split('/').pop() || file : file.name,
        urlOrFile: file
      },
      loader: DEFAULT_VALUES.loader
    });
  },
  setAvailableImages: (files: (File | string)[]) => set({ availableImages: files }),
  addNewFile: (file: File | string) =>
    set((state) => ({
      availableImages: [...state.availableImages, file]
    })),
  removeFileByName: (fileName: string) =>
    set((state) => ({
      availableImages: state.availableImages.filter((entry) => {
        if (typeof entry === 'string') {
          return entry.split('/').pop() !== fileName && entry !== fileName;
        }
        return entry.name !== fileName;
      })
    }))
}));
