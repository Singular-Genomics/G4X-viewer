export type PolygonDrawingStore = PolygonDrawingStoreValues & PolygonDrawingStoreMethods;

export type PolygonFeature = {
  type: 'Feature';
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  properties: any;
};

export type PolygonDrawingStoreValues = {
  isPolygonDrawingEnabled: boolean;
  polygonFeatures: PolygonFeature[];
  selectedFeatureIndex: number | null;
  mode: any;
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
};
