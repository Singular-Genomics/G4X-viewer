import { PixelSource } from '../PictureInPictureViewer/PictureInPictureViewer.types';

export type DetailViewProps = {
  id: string;
  x?: number;
  y?: number;
  height: number;
  width: number;
};

export type ImageLayerProps = {
  loader: PixelSource[];
  contrastLimits: number[][];
  colors: number[][];
  channelsVisible: boolean[];
  selections: any[];
  colormap?: string;
  lensEnabled?: boolean;
  lensSelection?: number;
  lensRadius?: number;
  lensBorderColor?: [number, number, number];
  lensBorderRadius?: number;
  extensions?: any[];
  transparentColor?: [number, number, number];
  onViewportLoad?: () => void;
  [key: string]: any;
};

export type ViewStateProps = {
  viewState: any;
  currentViewState?: any;
};
