import { SegmentationMetadata, SingleMask } from '../../shared/types';
import { SelectionData } from '../PolygonDrawingStore';
import { ClusterLabelEntry } from '../../utils/ZarrCellsLoader';
import { ZarrLayerConfig } from '../../utils/ZarrDataSet.types';

export type CellSegmentationLayerStore = CellSegmentationLayerStoreValues & CellSegmentationLayerStoreMethods;

export type SegmentationOption = {
  label: string;
  folderName: string;
};

export type CellSegmentationLayerStoreValues = {
  cellMasksData: SingleMask[] | null;
  segmentationMetadata?: SegmentationMetadata;
  fileName: string;
  isCellLayerOn: boolean;
  isCellNameFilterOn: boolean;
  showFilteredCells: boolean;
  cellFillOpacity: number;
  showBoundary: boolean;
  boundaryWidth: number;
  cellColormapConfig: CellSegmentationColormapEntry[];
  cellNameFilters: string[];
  selectedCells: SelectionData<SingleMask>[];
  umapDataAvailable: boolean;
  availableSegmentations: SegmentationOption[];
  selectedSegmentationLabel: string;
  selectedSegmentationFolder: string;
  availableClusterLabels: ClusterLabelEntry[];
  selectedClusterLabelKey: string;
  cellsLayerConfig: ZarrLayerConfig | null;
};

export type CellSegmentationLayerStoreMethods = {
  toggleCellLayer: () => void;
  toggleCellNameFilter: () => void;
  toggleShowFilteredCells: () => void;
  setCellFillOpacity: (newOpacity: number) => void;
  toggleBoundary: () => void;
  setBoundaryWidth: (width: number) => void;
  setCellColormapConfig: (config: CellSegmentationColormapEntry[]) => void;
  setCellNameFilter: (cellName: string[]) => void;
  clearCellNameFilter: () => void;
  setSelectedCells: (selectionData: SelectionData<SingleMask>[]) => void;
  addSelectedCells: (newSelectionData: SelectionData<SingleMask>) => void;
  updateSelectedCells: (updatedData: SingleMask[], selectionId: number) => void;
  deleteSelectedCells: (selectionId: number) => void;
  setSelectedSegmentationLabel: (label: string) => void;
  setSelectedSegmentationFolder: (folder: string) => void;
  setSelectedClusterLabelKey: (key: string) => void;
  setCellsLayerConfig: (config: ZarrLayerConfig | null) => void;
  reset: () => void;
};

export type CellSegmentationColormapEntry = {
  clusterId: string;
  color: number[];
};
