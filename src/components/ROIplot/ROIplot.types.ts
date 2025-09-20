export interface ROIplotDataPoint {
  roiName: string;
  values: number[];
  polygonId: number;
}

export interface ProcessedROIplotData {
  geneData: ROIplotDataPoint[];
}
