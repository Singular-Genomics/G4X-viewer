export type UmapGraphStore = UmapGraphStoreValues;

export type UmapGraphStoreValues = {
  ranges?: UmapRange;
  settings: UmapGraphSettings;
};

export type UmapRange = {
  xStart: number;
  xEnd: number;
  yStart: number;
  yEnd: number;
};

type UmapGraphSettings = {
  pointSize: number;
  subsamplingValue: number;
};
