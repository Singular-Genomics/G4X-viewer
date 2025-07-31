import { create } from 'zustand';
import { DrawPolygonMode, ModifyMode } from '@deck.gl-community/editable-layers';
import { useTranscriptLayerStore } from '../TranscriptLayerStore';
import { useCellSegmentationLayerStore } from '../CellSegmentationLayerStore/CellSegmentationLayerStore';
import { PolygonDrawingStore, PolygonDrawingStoreValues } from './PolygonDrawingStore.types';
import { exportPolygons, importPolygons } from './PolygonDrawingStore.helpers';

const DEFAULT_POLYGON_DRAWING_STORE_VALUES: PolygonDrawingStoreValues = {
  isPolygonDrawingEnabled: false,
  polygonFeatures: [],
  selectedFeatureIndex: null,
  mode: new DrawPolygonMode(),
  isDetecting: false
};

export const usePolygonDrawingStore = create<PolygonDrawingStore>((set, get) => ({
  ...DEFAULT_POLYGON_DRAWING_STORE_VALUES,

  togglePolygonDrawing: () =>
    set((state) => ({
      isPolygonDrawingEnabled: !state.isPolygonDrawingEnabled,
      mode: !state.isPolygonDrawingEnabled ? new DrawPolygonMode() : new DrawPolygonMode()
    })),

  setDrawPolygonMode: () => set({ mode: new DrawPolygonMode() }),

  setModifyMode: () => set({ mode: new ModifyMode() }),

  updatePolygonFeatures: (features) => set({ polygonFeatures: features }),

  selectFeature: (index) => set({ selectedFeatureIndex: index }),

  setDetecting: (detecting) => set({ isDetecting: detecting }),

  clearPolygons: () => {
    useTranscriptLayerStore.getState().setSelectedPoints([]);
    useCellSegmentationLayerStore.getState().setSelectedCells([]);
    set({ polygonFeatures: [], selectedFeatureIndex: null });
  },

  exportPolygons: () => {
    const { polygonFeatures } = get();
    exportPolygons(polygonFeatures);
  },

  importPolygons: async (file: File) => {
    const features = await importPolygons(file);
    set({ polygonFeatures: features, selectedFeatureIndex: null });
  }
}));
