export type TranscriptTooltipProps = {
  data: TranscriptDatapointType;
}

export type TranscriptDatapointType = {
  position: number[];
  color: number[];
  geneName: string;
  cellId: string;
}