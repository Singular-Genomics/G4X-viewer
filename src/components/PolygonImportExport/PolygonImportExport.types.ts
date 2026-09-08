import { PointData, SingleMask, UmapEntry } from '../../shared/types';
import { PolygonFeature } from '../../stores/PolygonDrawingStore/PolygonDrawingStore.types';

export interface PolygonImportExportProps {
  polygonFeatures: PolygonFeature[];
  isDetecting?: boolean;
}

export type CellsExportData = Record<
  string,
  {
    coordinates: [number, number][];
    cells: Omit<SingleMask, 'nonzeroGeneIndices' | 'nonzeroGeneValues' | 'proteinValues' | 'centroid'>[];
    polygonId: number;
    notes?: string;
  }
>;

export type TranscriptsExportData = Record<
  string,
  {
    coordinates: [number, number][];
    transcripts: PointData[];
    polygonId: number;
    notes?: string;
  }
>;

// Canonical per-ROI export data shared by the JSON and CSV serializers
export type RoiTranscriptExport = {
  roiName: string;
  polygonId: number;
  coordinates: [number, number][];
  notes: string;
  transcripts: PointData[];
};

export type CellExportRecord = {
  cellId: string;
  area: number;
  totalCounts: number;
  totalGenes: number;
  clusterId: string;
  vertices: number[];
  umapValues: UmapEntry;
  protein: Record<string, number>;
  // null when gene expression is excluded (toggle off or no gene names)
  transcript: Record<string, number> | null;
};

export type RoiCellExport = {
  roiName: string;
  polygonId: number;
  coordinates: [number, number][];
  notes: string;
  hasSegmentationMetadata: boolean;
  proteinNames: string[];
  geneNames: string[];
  cells: CellExportRecord[];
};

export type TarFileEntry = {
  name: string;
  content: string;
};

export const EXPORT_FORMATS = {
  INDIVIDUAL: 'individual',
  TAR: 'tar',
  ZIP: 'zip'
} as const;

export type ExportFormat = (typeof EXPORT_FORMATS)[keyof typeof EXPORT_FORMATS];

export type ExportDataType = 'transcripts' | 'segmentation';

export type InternalDataType = 'cells' | 'transcripts';
