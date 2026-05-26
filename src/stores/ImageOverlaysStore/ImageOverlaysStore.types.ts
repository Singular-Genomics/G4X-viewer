import { SelectionsType } from '../../components/PictureInPictureViewerAdapter';
import { ViewerSourceType } from '../ViewerStore';

export type LocalZarrImage = {
  __localZarrImage: true;
  name: string;
  store: any;
};

export type AvailableImageEntry = File | string | LocalZarrImage;

export type ImageOverlaysStore = ImageOverlaysStoreValues & ImageOverlaysStoreMethods;

export type ImageOverlaysStoreValues = {
  brightfieldImageSource: ViewerSourceType | null;
  omeTiffImageSource: ViewerSourceType | null;
  loader: any; // <- This is quite complicated
  omeTiffLoader: any;
  omeTiffMetadata: any;
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
  availableImages: AvailableImageEntry[];
  availableOmeTiffImages: (File | string)[];
};

export type ImageOverlaysStoreMethods = {
  reset: () => void;
  getLoader: () => any;
  getOmeTiffLoader: () => any;
  toggleImageLayer: () => void;
  setActiveImage: (file: AvailableImageEntry | null) => void;
  setActiveOmeTiffImage: (file: File | string | null) => void;
  addNewFile: (file: AvailableImageEntry) => void;
  addOmeTiffFile: (file: File | string) => void;
  removeOmeTiffFileByName: (fileName: string) => void;
};
