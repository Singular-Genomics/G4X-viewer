import { SelectionsType } from '../../components/PictureInPictureViewerAdapter';
import { ViewerSourceType } from '../ViewerStore';

export type BrightfieldImagesStore = BrightfieldImagesStoreValues & BrightfieldImagesStoreMethods;

export type BrightfieldImagesStoreValues = {
  brightfieldImageSource: ViewerSourceType | null;
  loader: any; // <- This is quite complicated
  image: number;
  selections: SelectionsType[];
  opacity: number;
  contrastLimits: number[][];
  isImageLoading: boolean;
  isLayerVisible: boolean;
  availableImages: (File | string)[];
};

export type BrightfieldImagesStoreMethods = {
  reset: () => void;
  getLoader: () => any;
  toggleImageLayer: () => void;
  setActiveImage: (file: File | string | null) => void;
  setAvailableImages: (files: (File | string)[]) => void;
  addNewFile: (file: File | string) => void;
  removeFileByName: (fileName: string) => void;
};
