import { create } from 'zustand';
import {
  BrightfieldImagesStore,
  BrightfieldImagesStoreValues,
  AvailableImageEntry
} from './BrightfieldImagesStore.types';
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

function getEntryName(entry: AvailableImageEntry): string {
  if (typeof entry === 'string') return entry.split('/').pop() || entry;
  if ('__localZarrImage' in entry) return entry.name;
  return entry.name;
}

export const useBrightfieldImagesStore = create<BrightfieldImagesStore>((set, get) => ({
  ...DEFAULT_VALUES,
  reset: () => set({ ...DEFAULT_VALUES }),
  getLoader: () => {
    const { loader, image } = get();
    return Array.isArray(loader[0]) ? loader[image] : loader;
  },
  toggleImageLayer: () => set((store) => ({ isLayerVisible: !store.isLayerVisible })),
  setActiveImage: (file: AvailableImageEntry | null) => {
    if (file === null) {
      set({
        brightfieldImageSource: null,
        loader: DEFAULT_VALUES.loader
      });
      return;
    }

    if (typeof file !== 'string' && '__localZarrImage' in file) {
      set({
        brightfieldImageSource: {
          description: file.name,
          urlOrFile: file.store
        },
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
  setAvailableImages: (files: AvailableImageEntry[]) => set({ availableImages: files }),
  addNewFile: (file: AvailableImageEntry) =>
    set((state) => ({
      availableImages: [...state.availableImages, file]
    })),
  removeFileByName: (fileName: string) =>
    set((state) => ({
      availableImages: state.availableImages.filter((entry) => getEntryName(entry) !== fileName)
    }))
}));
