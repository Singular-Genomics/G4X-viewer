import { PolygonFeature } from '../../stores/PolygonDrawingStore/PolygonDrawingStore.types';

export interface PolygonImportExportProps {
  exportPolygonsWithCells: () => void;
  exportPolygonsWithTranscripts: () => void;
  importPolygons: (file: File) => Promise<void>;
  polygonFeatures: PolygonFeature[];
}
