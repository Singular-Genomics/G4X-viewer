import { create } from 'zustand';
import { DrawPolygonMode, ModifyMode } from '@deck.gl-community/editable-layers';
import { useTranscriptLayerStore } from '../TranscriptLayerStore';
import { useCellSegmentationLayerStore } from '../CellSegmentationLayerStore/CellSegmentationLayerStore';
import { PolygonDrawingStore, PolygonDrawingStoreValues } from './PolygonDrawingStore.types';
import {
  exportPolygonsWithCells,
  exportPolygonsWithTranscripts,
  importPolygons,
  updatePolygonFeaturesWithIds,
  getHighestPolygonId
} from './PolygonDrawingStore.helpers';

const DEFAULT_POLYGON_DRAWING_STORE_VALUES: PolygonDrawingStoreValues = {
  isPolygonDrawingEnabled: false,
  isPolygonLayerVisible: true,
  polygonFeatures: [],
  selectedFeatureIndex: null,
  mode: new DrawPolygonMode(),
  isDetecting: false,
  nextPolygonId: 1,
  isViewMode: false,
  isDeleteMode: false,
  polygonOpacity: 0.5
};

export const usePolygonDrawingStore = create<PolygonDrawingStore>((set, get) => ({
  ...DEFAULT_POLYGON_DRAWING_STORE_VALUES,

  togglePolygonDrawing: () =>
    set((state) => ({
      isPolygonDrawingEnabled: !state.isPolygonDrawingEnabled,
      mode: !state.isPolygonDrawingEnabled ? new DrawPolygonMode() : new DrawPolygonMode(),
      isViewMode: state.isPolygonDrawingEnabled ? true : false,
      isDeleteMode: false
    })),

  togglePolygonLayerVisibility: () =>
    set((state) => ({
      isPolygonLayerVisible: !state.isPolygonLayerVisible
    })),

  setDrawPolygonMode: () => set({ mode: new DrawPolygonMode(), isViewMode: false, isDeleteMode: false }),

  setModifyMode: () => set({ mode: new ModifyMode(), isViewMode: false, isDeleteMode: false }),

  setViewMode: () => set({ isViewMode: true, mode: undefined, isDeleteMode: false }),

  setDeleteMode: () => set({ isDeleteMode: true, isViewMode: false, mode: undefined }),

  deletePolygon: (index) => {
    const { polygonFeatures } = get();
    const updatedFeatures = polygonFeatures.filter((_, i) => i !== index);

    // Calculate nextPolygonId based on highest existing ID
    const maxExistingId = getHighestPolygonId(updatedFeatures);

    // If no polygons left, switch to drawing mode
    if (updatedFeatures.length === 0) {
      set({
        polygonFeatures: updatedFeatures,
        selectedFeatureIndex: null,
        isDeleteMode: false,
        mode: new DrawPolygonMode(),
        isViewMode: false,
        nextPolygonId: 1
      });
    } else {
      // Keep delete mode active if polygons still exist, preserve existing IDs
      set({
        polygonFeatures: updatedFeatures,
        selectedFeatureIndex: null,
        nextPolygonId: maxExistingId + 1
      });
    }
  },

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
    const importedFeatures = await importPolygons(file);

    const maxImportedId = getHighestPolygonId(importedFeatures);

    // Replace all existing polygons with imported ones
    set({
      polygonFeatures: importedFeatures,
      selectedFeatureIndex: null,
      nextPolygonId: maxImportedId + 1
    });
  },

  setPolygonOpacity: (opacity: number) => set({ polygonOpacity: opacity })
}));
