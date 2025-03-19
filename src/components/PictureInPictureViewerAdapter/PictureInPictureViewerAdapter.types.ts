import { TiffPixelSource, ZarrPixelSource } from "@hms-dbmi/viv";

export type PictureInPictureViewerConfig = {
  contrastLimits: number[][];
  colors: number[][];
  channelsVisible: boolean[];
  loader: PixelSource[];
  selections: SelectionsType[];
  overview: OverviewConfig;
  overviewOn: boolean;
  height: number;
  width: number;
}

export type SelectionsType = {
  [x: string]: number | undefined;
}

type PixelSource = TiffPixelSource<string[]> | ZarrPixelSource<string[]>;

type OverviewPosition = 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';

type OverviewConfig = {
  margin: number;
  scale: number;
  position: OverviewPosition;
}