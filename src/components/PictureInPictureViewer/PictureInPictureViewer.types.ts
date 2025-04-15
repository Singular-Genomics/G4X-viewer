import { TiffPixelSource, ZarrPixelSource } from '@hms-dbmi/viv';

// Define PixelSource type
export type PixelSource = TiffPixelSource<string[]> | ZarrPixelSource<string[]>;

export type SelectionsType = {
  [x: string]: number | undefined;
};

export type OverviewSettings = {
  scale?: number;
  margin?: number;
  position?: string;
  minimumWidth?: number;
  maximumWidth?: number;
  boundingBoxColor?: number[];
  boundingBoxOutlineWidth?: number;
  viewportOutlineColor?: number[];
  viewportOutlineWidth?: number;
};

export type HoverHooks = {
  handleValue: (valueArray: any) => void;
  handleCoordnate: (coordinate: any) => void;
};

export type ViewState = {
  target: [number, number, number];
  zoom: number;
  id: string;
  [key: string]: any;
};

export type ViewStateChangeParams = {
  viewState: any;
  viewId: string;
  interactionState: any;
  oldViewState: any;
};

export type ViewStateChange = (params: ViewStateChangeParams) => void;

export type Hover = (info: any, event: any) => void;

export type PictureInPictureViewerProps = {
  contrastLimits: number[][] | [number, number][];
  colors: number[][] | [number, number, number][];
  channelsVisible: boolean[];
  colormap?: string;
  loader: PixelSource[];
  selections: any[];
  overview?: OverviewSettings;
  overviewOn: boolean;
  hoverHooks?: HoverHooks;
  viewStates?: ViewState[];
  height: number;
  width: number;
  extensions?: any[];
  clickCenter?: boolean;
  lensEnabled?: boolean;
  lensSelection?: number;
  lensRadius?: number;
  lensBorderColor?: [number, number, number];
  lensBorderRadius?: number;
  transparentColor?: [number, number, number];
  snapScaleBar?: boolean;
  onViewStateChange?: ViewStateChange;
  onHover?: Hover;
  onViewportLoad?: () => void;
  deckProps?: any;
};
