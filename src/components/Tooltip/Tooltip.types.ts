import { SingleMask } from '../../shared/types';

export type TranscriptDatapointType = {
  position: number[];
  color: number[];
  geneName: string;
  cellId: string;
};

export type CellMaskDatapointType = SingleMask;
