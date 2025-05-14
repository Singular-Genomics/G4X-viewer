export type UmapGraphStore = UmapGraphStoreValues & UmapGraphStoreMethods;

export type UmapGraphStoreValues = {
  ranges?: UmapRange;
  settings: UmapGraphSettings;
};

export type UmapGraphStoreMethods = {
  resetFilters: () => void;
  updateSettings: (newSettings: Partial<UmapGraphSettings>) => void;
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
