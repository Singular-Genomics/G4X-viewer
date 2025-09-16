import { PointData, SingleMask } from '../../shared/types';
import { PolygonFeature } from '../../stores/PolygonDrawingStore/PolygonDrawingStore.types';

export interface PolygonImportExportProps {
  exportPolygonsWithCells: () => void;
  exportPolygonsWithTranscripts: () => void;
  polygonFeatures: PolygonFeature[];
  isDetecting?: boolean;
}

export type CellsExportData = Record<
  string,
  {
    coordinates: [number, number][];
    cells: SingleMask[];
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

export type TarFileEntry = {
  name: string;
  content: string;
};
