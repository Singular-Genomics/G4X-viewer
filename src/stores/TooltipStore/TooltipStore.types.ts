export type TooltipStore = TooltipStoreValues;

export type TooltipStoreValues = {
  position: Position;
  visible: boolean;
  object?: TranscriptDatapointType;
}

export type TranscriptDatapointType = {
  position: number[];
  color: number[];
  geneName: string;
  cellId: string;
}

type Position = {
  x: number,
  y: number,
}

