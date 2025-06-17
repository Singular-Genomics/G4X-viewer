export type TranscriptLayerStore = TranscriptLayerStoreValues & TranscriptLayerStoreMethods;

export type TileZoomBreakpoint = {
  tileIndex: number;
  zoomThreshold: number;
};

export type TranscriptLayerStoreValues = {
  isTranscriptLayerOn: boolean;
  isGeneNameFilterActive: boolean;
  showFilteredPoints: boolean;
  showTilesBoundries: boolean;
  showTilesData: boolean;
  maxVisibleLayers: number;
  overrideLayers: boolean;
  pointSize: number;
  geneNameFilters: GeneNameFilterType;
  currentVisibleLayer: number;
  tileZoomBreakpoints: TileZoomBreakpoint[];
};

export type GeneNameFilterType = string[];

export type TranscriptLayerStoreMethods = {
  toggleTranscriptLayer: () => void;
  toggleTileBoundries: () => void;
  toggleTileData: () => void;
  toggleGeneNameFilter: () => void;
  toggleShowFilteredPoints: () => void;
  toggleOverrideLayer: () => void;
  setPointSize: (newPointSize: number) => void;
  setGeneNamesFilter: (geneNames: GeneNameFilterType) => void;
  clearGeneNameFilters: () => void;
  updateTileZoomBreakpoint: (tileIndex: number, currentZoom: number) => void;
  getCurrentTileIndexForZoom: (zoom: number) => number;
  reset: () => void;
};
