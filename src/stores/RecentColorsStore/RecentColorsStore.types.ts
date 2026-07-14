export type RecentColorsStore = RecentColorsStoreValues & RecentColorsStoreMethods;

export type RecentColorsStoreValues = {
  recentColors: number[][];
};

export type RecentColorsStoreMethods = {
  addRecentColor: (rgb: number[]) => void;
};
