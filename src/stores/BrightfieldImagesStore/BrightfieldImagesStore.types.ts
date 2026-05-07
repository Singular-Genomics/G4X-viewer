import { SelectionsType } from '../../components/PictureInPictureViewerAdapter';
import { ViewerSourceType } from '../ViewerStore';

export type LocalZarrImage = {
  __localZarrImage: true;
  name: string;
  store: any;
};

export type AvailableImageEntry = File | string | LocalZarrImage;

export type BrightfieldImagesStore = BrightfieldImagesStoreValues & BrightfieldImagesStoreMethods;

export type BrightfieldImagesStoreValues = {
  brightfieldImageSource: ViewerSourceType | null;
  loader: any; // <- This is quite complicated
  image: number;
  selections: SelectionsType[];
  opacity: number;
  contrastLimits: number[][];
  colors: [number, number, number][];
  isLayerVisible: boolean;
  availableImages: AvailableImageEntry[];
};

export type BrightfieldImagesStoreMethods = {
  reset: () => void;
  getLoader: () => any;
  toggleImageLayer: () => void;
  setActiveImage: (file: AvailableImageEntry | null) => void;
  setAvailableImages: (files: AvailableImageEntry[]) => void;
  addNewFile: (file: AvailableImageEntry) => void;
  removeFileByName: (fileName: string) => void;
};
