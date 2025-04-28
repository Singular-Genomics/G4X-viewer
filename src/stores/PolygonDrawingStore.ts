import { create } from 'zustand';
import { DrawPolygonMode, ModifyMode, ViewMode } from '@deck.gl-community/editable-layers';

type PolygonFeature = {
  type: 'Feature';
  geometry: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  properties: any;
};

type PolygonDrawingState = {
  isPolygonDrawingEnabled: boolean;
  polygonFeatures: PolygonFeature[];
  selectedFeatureIndex: number | null;
  mode: any;

  // Actions
  togglePolygonDrawing: () => void;
  setDrawPolygonMode: () => void;
  setModifyMode: () => void;
  setViewMode: () => void;
  updatePolygonFeatures: (features: PolygonFeature[]) => void;
  selectFeature: (index: number | null) => void;
  clearPolygons: () => void;
};

export const usePolygonDrawingStore = create<PolygonDrawingState>((set) => ({
  isPolygonDrawingEnabled: false,
  polygonFeatures: [],
  selectedFeatureIndex: null,
  mode: new ViewMode(),

  togglePolygonDrawing: () =>
    set((state) => ({
      isPolygonDrawingEnabled: !state.isPolygonDrawingEnabled,
      mode: !state.isPolygonDrawingEnabled ? new DrawPolygonMode() : new ViewMode()
    })),

  setDrawPolygonMode: () => set({ mode: new DrawPolygonMode() }),

  setModifyMode: () => set({ mode: new ModifyMode() }),

  setViewMode: () => set({ mode: new ViewMode() }),

  updatePolygonFeatures: (features) => set({ polygonFeatures: features }),

  selectFeature: (index) => set({ selectedFeatureIndex: index }),

  clearPolygons: () => set({ polygonFeatures: [], selectedFeatureIndex: null })
}));
