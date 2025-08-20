import { GeoJsonEditMode, FeatureOf, Polygon } from '@deck.gl-community/editable-layers';

export type PolygonDrawingStore = PolygonDrawingStoreValues & PolygonDrawingStoreMethods;

export type PolygonFeature = FeatureOf<Polygon>;

export type Point2D = [number, number];

export type LineSegment = {
  start: Point2D;
  end: Point2D;
  id: number;
};

export type IntersectionResult = {
  hasIntersection: boolean;
};

export type SelectionData<T> = {
  roiId: number;
  data: T[];
};

export type BoundingBox = {
  top: number;
  bottom: number;
  left: number;
  right: number;
};

export type PolygonDrawingStoreValues = {
  isPolygonDrawingEnabled: boolean;
  isPolygonLayerVisible: boolean;
  polygonFeatures: PolygonFeature[];
  selectedFeatureIndex: number | null;
  mode: GeoJsonEditMode;
  isDetecting: boolean;
  isViewMode: boolean;
  isDeleteMode: boolean;
  polygonOpacity: number;
};

export type PolygonDrawingStoreMethods = {
  togglePolygonDrawing: () => void;
  togglePolygonLayerVisibility: () => void;
  setDrawPolygonMode: () => void;
  setModifyMode: () => void;
  setViewMode: () => void;
  setDeleteMode: () => void;
  addPolygon: (features: PolygonFeature) => number;
  updatePolygon: (updatedFeature: PolygonFeature, polygonId: number) => void;
  deletePolygon: (index: number) => void;
  selectFeature: (index: number | null) => void;
  clearPolygons: () => void;
  exportPolygonsWithCells: () => void;
  exportPolygonsWithTranscripts: () => void;
  // importPolygons: (importedFeatures: PolygonFeature[]) => void;
  setDetecting: (detecting: boolean) => void;
  setPolygonOpacity: (opacity: number) => void;
};
