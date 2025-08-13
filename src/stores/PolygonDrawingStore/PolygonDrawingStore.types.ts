import { GeoJsonEditMode, FeatureOf, Polygon } from '@deck.gl-community/editable-layers';

export type PolygonDrawingStore = PolygonDrawingStoreValues & PolygonDrawingStoreMethods;

export type PolygonFeature = FeatureOf<Polygon>;

export type PolygonDrawingStoreValues = {
  isPolygonDrawingEnabled: boolean;
  isPolygonLayerVisible: boolean;
  polygonFeatures: PolygonFeature[];
  selectedFeatureIndex: number | null;
  mode: GeoJsonEditMode;
  isDetecting: boolean;
  nextPolygonId: number;
  isViewMode: boolean;
};

export type PolygonDrawingStoreMethods = {
  togglePolygonDrawing: () => void;
  togglePolygonLayerVisibility: () => void;
  setDrawPolygonMode: () => void;
  setModifyMode: () => void;
  setViewMode: () => void;
  updatePolygonFeatures: (features: PolygonFeature[]) => void;
  selectFeature: (index: number | null) => void;
  clearPolygons: () => void;
  exportPolygonsWithCells: () => void;
  exportPolygonsWithTranscripts: () => void;
  importPolygons: (file: File) => Promise<void>;
  setDetecting: (detecting: boolean) => void;
};
