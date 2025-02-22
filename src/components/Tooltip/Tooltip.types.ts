export type TranscriptDatapointType = {
  position: number[];
  color: number[];
  geneName: string;
  cellId: string;
}

export type CellMaskDatapointType = {
  cellId: string;
  clusterId: string;
  color: number[];
  area: string;
  totalGenes: string;
  totalCounts: string;
}