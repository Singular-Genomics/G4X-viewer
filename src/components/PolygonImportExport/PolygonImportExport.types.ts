import { PointData, SingleMask } from '../../shared/types';
import { PolygonFeature } from '../../stores/PolygonDrawingStore/PolygonDrawingStore.types';

export interface PolygonImportExportProps {
  exportPolygonsWithCells: (includeGenes: boolean) => void;
  exportPolygonsWithTranscripts: () => void;
  polygonFeatures: PolygonFeature[];
  isDetecting?: boolean;
}

export type CellsExportData = Record<
  string,
  {
    coordinates: [number, number][];
    cells: Omit<SingleMask, 'nonzeroGeneIndices' | 'nonzeroGeneValues' | 'proteinValues'>[];
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
