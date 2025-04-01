export type CytometryDataPoint = {
  value_X: number;
  value_Y: number;
  count: number;
};

export type CytometryGraphProps = {
  data: CytometryDataPoint[];
};
