import {} from '@hms-dbmi/viv';
import { SelectionsType } from '../../components/PictureInPictureViewerAdapter/PictureInPictureViewerAdapter.types';

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
  pyramidResolution: number;
  viewportWidth: number;
  viewportHeight: number;
  viewState?: any;
};

export type ViewerStoreMethods = {
  toggleOverview: () => void;
  toggleLens: () => void;
  onViewportLoad: () => void;
  setIsChannelLoading: (index: number, val: boolean) => void;
  addIsChannelLoading: (val: boolean) => void;
  removeIsChannelLoading: (index: number) => void;
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
