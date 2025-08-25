import { create } from 'zustand';
import { DrawPolygonMode, ModifyMode } from '@deck.gl-community/editable-layers';
import { useTranscriptLayerStore } from '../TranscriptLayerStore';
import { useCellSegmentationLayerStore } from '../CellSegmentationLayerStore/CellSegmentationLayerStore';
import { PolygonDrawingStore, PolygonDrawingStoreValues } from './PolygonDrawingStore.types';
import {
  exportPolygonsWithCells,
  exportPolygonsWithTranscripts,
  getHighestPolygonId
} from './PolygonDrawingStore.helpers';

const DEFAULT_POLYGON_DRAWING_STORE_VALUES: PolygonDrawingStoreValues = {
  isPolygonDrawingEnabled: false,
  isPolygonLayerVisible: true,
  polygonFeatures: [],
  selectedFeatureIndex: null,
  mode: new DrawPolygonMode(),
  isDetecting: false,
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
  setPolygons: (features) =>
    set((store) => ({
      ...DEFAULT_POLYGON_DRAWING_STORE_VALUES,
      polygonOpacity: store.polygonOpacity,
      polygonFeatures: features
    })),
  addPolygon: (feature) => {
    const { polygonFeatures } = get();
    const newPolygonId = getHighestPolygonId(polygonFeatures) + 1;

    set({
      polygonFeatures: [
        ...polygonFeatures,
        {
          ...feature,
          properties: {
            ...feature.properties,
            polygonId: newPolygonId
          }
        }
      ]
    });

    return newPolygonId;
  },
  deletePolygon: (polygonId) => {
    const { polygonFeatures } = get();
    const updatedFeatures = polygonFeatures.filter((entry) => entry.properties?.polygonId !== polygonId);
    if (updatedFeatures.length === 0) {
      set({
        polygonFeatures: updatedFeatures,
        selectedFeatureIndex: null,
        isDeleteMode: false,
        mode: new DrawPolygonMode(),
        isViewMode: false
      });
    } else {
      set({
        polygonFeatures: updatedFeatures,
        selectedFeatureIndex: null
      });
    }
  },
  updatePolygon: (updatedFeature, polygonId) => {
    const { polygonFeatures } = get();
    const updatedData = polygonFeatures.map((feature) => {
      if (feature.properties?.polygonId !== polygonId) {
        return feature;
      }

      return {
        ...feature,
        ...updatedFeature,
        properties: {
          ...feature.properties,
          polygonId: polygonId
        }
      };
    });

    set({
      polygonFeatures: updatedData
    });
  },
  selectFeature: (index) => set({ selectedFeatureIndex: index }),
  setDetecting: (detecting) => set({ isDetecting: detecting }),
  clearPolygons: () => {
    useTranscriptLayerStore.getState().setSelectedPoints([]);
    useCellSegmentationLayerStore.getState().setSelectedCells([]);
    set({ polygonFeatures: [], selectedFeatureIndex: null, isViewMode: false });
  },
  exportPolygonsWithCells: () => {
    const { polygonFeatures } = get();
    exportPolygonsWithCells(polygonFeatures);
  },
  exportPolygonsWithTranscripts: () => {
    const { polygonFeatures } = get();
    exportPolygonsWithTranscripts(polygonFeatures);
  },
  importPolygons: (importedFeatures: any) => {
    set({
      polygonFeatures: importedFeatures,
      selectedFeatureIndex: null
    });
  },

  setPolygonOpacity: (opacity: number) => set({ polygonOpacity: opacity })
}));
