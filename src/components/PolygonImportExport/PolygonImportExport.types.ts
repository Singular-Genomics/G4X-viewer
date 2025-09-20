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
    cells: (Omit<SingleMask, 'nonzeroGeneIndices' | 'nonzeroGeneValues' | 'proteinValues'> & {
      protein?: Record<string, number>;
      transcript?: Record<string, number>;
    })[];
    polygonId: number;
  }
>;

export type TranscriptsExportData = Record<
  string,
  {
    coordinates: [number, number][];
    transcripts: PointData[];
    polygonId: number;
  }
>;
