import { SelectionsType } from "../../components/PictureInPictureViewerAdapter";
import { ViewerSourceType } from "../ViewerStore";

export type HEImagesStore = HEImagesStoreValues & HEImagesStoreMethods;

export type HEImagesStoreValues = {
  heImageSource: ViewerSourceType | null;
  loader: any; // <- This is quite complicated
  image: number;
  selections: SelectionsType[];
  opacity: number;
  contrastLimits: number[][];
  isImageLoading: boolean;
  isLayerVisible: boolean;
};

export type HEImagesStoreMethods = {
  reset: () => void;
  getLoader: () => any;
  toggleImageLayer: () => void;
};
