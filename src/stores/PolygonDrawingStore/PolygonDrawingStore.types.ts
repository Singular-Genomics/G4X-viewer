import { GeoJsonEditMode, FeatureOf, Polygon } from '@deck.gl-community/editable-layers';

export type PolygonDrawingStore = PolygonDrawingStoreValues & PolygonDrawingStoreMethods;

export type PolygonFeature = FeatureOf<Polygon>;

export type PolygonDrawingStoreValues = {
  isPolygonDrawingEnabled: boolean;
  polygonFeatures: PolygonFeature[];
  selectedFeatureIndex: number | null;
  mode: GeoJsonEditMode;
  isDetecting: boolean;
  nextPolygonId: number;
  isViewMode: boolean;
};

export type PolygonDrawingStoreMethods = {
  togglePolygonDrawing: () => void;
  setDrawPolygonMode: () => void;
  setModifyMode: () => void;
  setViewMode: () => void;
  updatePolygonFeatures: (features: PolygonFeature[]) => void;
  selectFeature: (index: number | null) => void;
  clearPolygons: () => void;
  exportPolygons: () => void;
  importPolygons: (file: File) => Promise<void>;
  setDetecting: (detecting: boolean) => void;
};
