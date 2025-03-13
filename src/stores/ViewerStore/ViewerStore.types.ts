import {} from "@hms-dbmi/viv";
import { SelectionsType } from "../../components/PictureInPictureViewerAdapter/PictureInPictureViewerAdapter.types";

export type ViewerStore = ViewerStoreValues & ViewerStoreMethods;

export type ViewerStoreValues = {
  isChannelLoading: boolean[];
  isViewerLoading: boolean;
  isOverviewOn: boolean;
  isLensOn: boolean;
  useColorMap: boolean;
  colormap: string;
  globalSelection: SelectionsType;
  lensSelection: number;
  pixelValues: string[];
  hoverCoordinates: ViewerHoverCoordinates;
  channelOptions: string[];
  metadata: any; // <- This is complicated
  source: ViewerSourceType | null;
  generalDetails: GeneralDetailsType | null;
  pyramidResolution: number;
  viewportWidth: number;
  viewportHeight: number;
  viewState?: any;
};

export type ViewerStoreMethods = {
  reset: () => void;
  toggleOverview: () => void;
  toggleLens: () => void;
  onViewportLoad: () => void;
  setIsChannelLoading: (index: number, val: boolean) => void;
  addIsChannelLoading: (val: boolean) => void;
  removeIsChannelLoading: (index: number) => void;
  setGeneralDetails: (details: GeneralDetailsType) => void;
};

export type ViewerSourceType = {
  description: string;
  isDemoImage?: boolean;
  urlOrFile: string | File | File[];
};

export type ViewerHoverCoordinates = {
  x: string;
  y: string;
};

export type GeneralDetailsType = {
  fileName: string;
  data: Record<string, any>;
};
