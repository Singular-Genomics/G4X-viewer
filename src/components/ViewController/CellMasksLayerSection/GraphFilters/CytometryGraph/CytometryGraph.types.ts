export type CytometryDataPoint = {
  value_X: number;
  value_Y: number;
  count: number;
};

export type LoaderInfo = {
  progress?: number;
  message?: string;
};
