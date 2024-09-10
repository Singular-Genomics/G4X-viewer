export type MetadataLayerStore = MetadataLayerStoreValues &
  MetadataLayerStoreMethods;

export type MetadataLayerStoreValues = {
  isMetadataLayerOn: boolean;
  isGeneNameFilterActive: boolean;
  showFilteredPoints: boolean;
  showTilesBoundries: boolean;
  showTilesData: boolean;
  disableTiledView: boolean;
  pointSize: number;
  geneNameFilters: GeneNameFilterType;
};

export type GeneNameFilterType = string[];

export type MetadataLayerStoreMethods = {
  toggleMetadataLayer: () => void;
  toggleTileBoundries: () => void;
  toggleTileData: () => void;
  toggleGeneNameFilter: () => void;
  toggleShowFilteredPoints: () => void;
  toggleDisableTiledView: () => void;
  setPointSize: (newPointSize: number) => void;
  setGeneNamesFilter: (geneNames: GeneNameFilterType) => void;
  clearGeneNameFilters: () => void;
  reset: () => void;
};
