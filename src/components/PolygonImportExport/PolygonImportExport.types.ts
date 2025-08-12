import { PolygonFeature } from '../../stores/PolygonDrawingStore/PolygonDrawingStore.types';

export interface PolygonImportExportProps {
  exportPolygonsWithCells: () => void;
  exportPolygonsWithTranscripts: () => void;
  importPolygons: (file: File) => Promise<void>;
  polygonFeatures: PolygonFeature[];
}

export type ExportedCellData = {
  cell_id: string;
  totalCounts: number;
  totalGenes: number;
  area: number;
  clusterId: string;
  umapX: number;
  umapY: number;
  vertices: number[];
  color: number[];
  [proteinName: string]: string | number | number[];
};

export type CellsExportData = Record<
  string,
  {
    coordinates: [number, number][];
    cells: ExportedCellData[];
  }
>;

export type ExportedTranscriptData = {
  gene_name: string;
  count: number;
  position: number[];
  color: number[];
  cellId: string;
};

export type TranscriptsExportData = Record<
  string,
  {
    coordinates: [number, number][];
    transcripts: ExportedTranscriptData[];
  }
>;
