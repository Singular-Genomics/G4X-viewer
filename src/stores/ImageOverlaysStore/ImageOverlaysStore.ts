import { create } from 'zustand';
import { ImageOverlaysStore, ImageOverlaysStoreValues } from './ImageOverlaysStore.types';
import { MAX_UINT16_VALUE } from '../../shared/constants';

export const MAX_NUMBER_OF_IMAGES = 10;

const DEFAULT_COLORS: [number, number, number][] = [
  [255, 0, 0],
  [0, 255, 0],
  [0, 0, 255]
];

const DEFAULT_VALUES: ImageOverlaysStoreValues = {
  brightfieldImageSource: null,
  omeTiffImageSource: null,
  loader: [{ labels: [], shape: [] }],
  omeTiffLoader: [{ labels: [], shape: [] }],
  omeTiffMetadata: null,
  image: 0,
  contrastLimits: [[0, MAX_UINT16_VALUE]],
  omeTiffContrastLimits: [[0, MAX_UINT16_VALUE]],
  colors: DEFAULT_COLORS,
  omeTiffColors: DEFAULT_COLORS,
  selections: [{ z: 0, c: 0, t: 0 }],
  omeTiffSelections: [{ z: 0, c: 0, t: 0 }],
  opacity: 1,
  omeTiffOpacity: 1,
  isLayerVisible: true,
  availableImages: [],
  availableOmeTiffImages: []
};

export const useImageOverlaysStore = create<ImageOverlaysStore>((set, get) => ({
  ...DEFAULT_VALUES,
  reset: () => set({ ...DEFAULT_VALUES }),
  getLoader: () => {
    const { loader, image } = get();
    return Array.isArray(loader[0]) ? loader[image] : loader;
  },
  getOmeTiffLoader: () => {
    const { omeTiffLoader, image } = get();
    return Array.isArray(omeTiffLoader[0]) ? omeTiffLoader[image] : omeTiffLoader;
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
  setActiveOmeTiffImage: (file: File | string | null) => {
    if (file === null) {
      set({
        omeTiffImageSource: null,
        omeTiffLoader: DEFAULT_VALUES.omeTiffLoader
      });
      return;
    }

    set({
      omeTiffImageSource: {
        description: typeof file === 'string' ? file.split('/').pop() || file : file.name,
        urlOrFile: file
      },
      omeTiffLoader: DEFAULT_VALUES.omeTiffLoader
    });
  },
  addNewFile: (file: File | string) =>
    set((state) => ({
      availableImages: [...state.availableImages, file]
    })),
  addOmeTiffFile: (file: File | string) =>
    set((state) => ({
      availableOmeTiffImages: [...state.availableOmeTiffImages, file]
    })),
  removeOmeTiffFileByName: (fileName: string) =>
    set((state) => ({
      availableOmeTiffImages: state.availableOmeTiffImages.filter((entry) => {
        if (typeof entry === 'string') {
          return entry.split('/').pop() !== fileName && entry !== fileName;
        }
        return entry.name !== fileName;
      })
    }))
}));
