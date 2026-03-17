import { SelectionsType } from '../../components/PictureInPictureViewerAdapter';
import { ViewerSourceType } from '../ViewerStore';

export type BrightfieldImagesStore = BrightfieldImagesStoreValues & BrightfieldImagesStoreMethods;

export type BrightfieldImagesStoreValues = {
  brightfieldImageSource: ViewerSourceType | null;
  omeTiffImageSource: ViewerSourceType | null;
  loader: any; // <- This is quite complicated
  omeTiffLoader: any;
  image: number;
  selections: SelectionsType[];
  omeTiffSelections: SelectionsType[];
  opacity: number;
  omeTiffOpacity: number;
  contrastLimits: number[][];
  omeTiffContrastLimits: number[][];
  colors: [number, number, number][];
  omeTiffColors: [number, number, number][];
  isLayerVisible: boolean;
  availableImages: (File | string)[];
  availableOmeTiffImages: (File | string)[];
};

export type BrightfieldImagesStoreMethods = {
  reset: () => void;
  getLoader: () => any;
  getOmeTiffLoader: () => any;
  toggleImageLayer: () => void;
  setActiveImage: (file: File | string | null) => void;
  setActiveOmeTiffImage: (file: File | string | null) => void;
  setAvailableImages: (files: (File | string)[]) => void;
  addNewFile: (file: File | string) => void;
  removeFileByName: (fileName: string) => void;
  addOmeTiffFile: (file: File | string) => void;
  removeOmeTiffFileByName: (fileName: string) => void;
};
