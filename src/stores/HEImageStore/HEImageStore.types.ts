import { SelectionsType } from "../../components/PictureInPictureViewerAdapter";
import { ViewerSourceType } from "../ViewerStore";

export type HEImageStore = HEImageStoreValues & HEImageStoreMethods;

export type HEImageStoreValues = {
  heImageSource: ViewerSourceType | null;
  loader: any; // <- This is quite complicated
  image: number;
  selections: SelectionsType[];
  opacity: number;
  contrastLimits: number[][];
  isImageLoading: boolean;
};

export type HEImageStoreMethods = {
  reset: () => void;
  getLoader: () => any;
};
