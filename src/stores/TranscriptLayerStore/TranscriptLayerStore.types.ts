import { PointData } from '../../shared/types';
import { SelectionData } from '../PolygonDrawingStore';

export type TranscriptLayerStore = TranscriptLayerStoreValues & TranscriptLayerStoreMethods;

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
  selectedPoints: SelectionData<PointData>[];
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
  setSelectedPoints: (selectionData: SelectionData<PointData>[]) => void;
  addSelectedPoints: (newSelectionData: SelectionData<PointData>) => void;
  updateSelectedPoints: (updatedData: PointData[], selectionId: number) => void;
  deleteSelectedPoints: (selectionId: number) => void;
  reset: () => void;
};
