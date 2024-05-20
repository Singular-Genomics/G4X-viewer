export type MetadataLayerStore = MetadataLayerStoreValues & MetadataLayerStoreMethods;

export type MetadataLayerStoreValues = {
  isMetadataLayerOn: boolean;
  isGeneNameFilterActive: boolean;
  showFilteredPoints: boolean;
  showTilesBoundries: boolean;
  showTilesData: boolean;
  pointSize: number;
  geneNameFilters: GeneNameFilterType;
}

export type GeneNameFilterType = string[] | 'all';

export type MetadataLayerStoreMethods = {
  toggleMetadataLayer: () => void;
  toggleTileBoundries: () => void;
  toggleTileData: () => void;
  toggleGeneNameFilter: () => void;
  toggleShowFilteredPoints: () => void;
  setPointSize: (newPointSize: number) => void;
  setGeneNamesFilter: (geneNames: GeneNameFilterType) => void;
  clearGeneNameFilters: () => void;
}