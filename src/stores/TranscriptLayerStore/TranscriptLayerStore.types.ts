export type TranscriptLayerStore = TranscriptLayerStoreValues &
  TranscriptLayerStoreMethods;

export type TranscriptLayerStoreValues = {
  isTranscriptLayerOn: boolean;
  isGeneNameFilterActive: boolean;
  showFilteredPoints: boolean;
  showTilesBoundries: boolean;
  showTilesData: boolean;
  disableTiledView: boolean;
  maxVisibleLayers: number;
  overrideLayers: boolean;
  pointSize: number;
  geneNameFilters: GeneNameFilterType;
};

export type GeneNameFilterType = string[];

export type TranscriptLayerStoreMethods = {
  toggleTranscriptLayer: () => void;
  toggleTileBoundries: () => void;
  toggleTileData: () => void;
  toggleGeneNameFilter: () => void;
  toggleShowFilteredPoints: () => void;
  toggleDisableTiledView: () => void;
  toggleOverrideLayer: () => void;
  setPointSize: (newPointSize: number) => void;
  setGeneNamesFilter: (geneNames: GeneNameFilterType) => void;
  clearGeneNameFilters: () => void;
  reset: () => void;
};
