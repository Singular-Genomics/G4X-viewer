import { create } from 'zustand';
import { DrawPolygonMode, ModifyMode } from '@deck.gl-community/editable-layers';
import { useTranscriptLayerStore } from '../TranscriptLayerStore';
import { useCellSegmentationLayerStore } from '../CellSegmentationLayerStore/CellSegmentationLayerStore';
import { PolygonDrawingStore, PolygonDrawingStoreValues } from './PolygonDrawingStore.types';
import {
  exportPolygonsWithCells,
  exportPolygonsWithTranscripts,
  importPolygons,
  updatePolygonFeaturesWithIds
} from './PolygonDrawingStore.helpers';

const DEFAULT_POLYGON_DRAWING_STORE_VALUES: PolygonDrawingStoreValues = {
  isPolygonDrawingEnabled: false,
  isPolygonLayerVisible: true,
  polygonFeatures: [],
  selectedFeatureIndex: null,
  mode: new DrawPolygonMode(),
  isDetecting: false,
  nextPolygonId: 1,
  isViewMode: false
};

export const usePolygonDrawingStore = create<PolygonDrawingStore>((set, get) => ({
  ...DEFAULT_POLYGON_DRAWING_STORE_VALUES,

  togglePolygonDrawing: () =>
    set((state) => ({
      isPolygonDrawingEnabled: !state.isPolygonDrawingEnabled,
      mode: !state.isPolygonDrawingEnabled ? new DrawPolygonMode() : new DrawPolygonMode(),
      isViewMode: state.isPolygonDrawingEnabled ? true : false
    })),

  togglePolygonLayerVisibility: () =>
    set((state) => ({
      isPolygonLayerVisible: !state.isPolygonLayerVisible
    })),

  setDrawPolygonMode: () => set({ mode: new DrawPolygonMode(), isViewMode: false }),

  setModifyMode: () => set({ mode: new ModifyMode(), isViewMode: false }),

  setViewMode: () => set({ isViewMode: true, mode: undefined }),

  updatePolygonFeatures: (features) => {
    const { nextPolygonId } = get();
    const { featuresWithIds, nextPolygonId: newNextId } = updatePolygonFeaturesWithIds(features, nextPolygonId);

    set({
      polygonFeatures: featuresWithIds,
      nextPolygonId: newNextId
    });
  },

  selectFeature: (index) => set({ selectedFeatureIndex: index }),

  setDetecting: (detecting) => set({ isDetecting: detecting }),

  clearPolygons: () => {
    useTranscriptLayerStore.getState().setSelectedPoints([]);
    useCellSegmentationLayerStore.getState().setSelectedCells([]);
    set({ polygonFeatures: [], selectedFeatureIndex: null, nextPolygonId: 1, isViewMode: false });
  },

  exportPolygonsWithCells: () => {
    const { polygonFeatures } = get();
    exportPolygonsWithCells(polygonFeatures);
  },

  exportPolygonsWithTranscripts: () => {
    const { polygonFeatures } = get();
    exportPolygonsWithTranscripts(polygonFeatures);
  },

  importPolygons: async (file: File) => {
    const features = await importPolygons(file);
    set({ polygonFeatures: features, selectedFeatureIndex: null });
  }
}));
