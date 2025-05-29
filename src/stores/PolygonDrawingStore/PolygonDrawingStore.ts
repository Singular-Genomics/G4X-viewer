import { create } from 'zustand';
import { DrawPolygonMode, ModifyMode, ViewMode } from '@deck.gl-community/editable-layers';
import { useTranscriptLayerStore } from '../TranscriptLayerStore';
import { useBinaryFilesStore } from '../BinaryFilesStore';
import * as protobuf from 'protobufjs';
import { TranscriptSchema } from '../../layers/transcript-layer/transcript-schema';
import { PolygonDrawingStore, PolygonDrawingStoreValues } from './PolygonDrawingStore.types';

const isPointInPolygon = (point: [number, number], coordinates: number[][]) => {
  let inside = false;
  const x = point[0],
    y = point[1];

  for (let i = 0, j = coordinates.length - 1; i < coordinates.length; j = i++) {
    const xi = coordinates[i][0],
      yi = coordinates[i][1];
    const xj = coordinates[j][0],
      yj = coordinates[j][1];

    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
};

const removeDuplicates = (points: any[]) => {
  const seen = new Set();
  return points.filter((point) => {
    if (!point?.position?.[0]) return false;
    const key = `${point.position[0]},${point.position[1]}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const loadTileData = (file: File) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = protobuf.Root.fromJSON(TranscriptSchema)
          .lookupType('TileData')
          .decode(new Uint8Array(reader.result as ArrayBuffer));
        resolve(data);
      } catch {
        resolve(null);
      }
    };
    reader.onerror = () => resolve(null);
    reader.readAsArrayBuffer(file);
  });
};

const DEFAULT_POLYGON_DRAWING_STORE_VALUES: PolygonDrawingStoreValues = {
  isPolygonDrawingEnabled: false,
  polygonFeatures: [],
  selectedFeatureIndex: null,
  mode: new ViewMode()
};

export const usePolygonDrawingStore = create<PolygonDrawingStore>((set, get) => ({
  ...DEFAULT_POLYGON_DRAWING_STORE_VALUES,

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

  clearPolygons: () => {
    useTranscriptLayerStore.getState().setSelectedPoints([]);
    set({ polygonFeatures: [], selectedFeatureIndex: null });
  },

  exportPolygons: () => {
    const polygons = get().polygonFeatures.map((f) => f.geometry.coordinates[0]);
    const blob = new Blob([JSON.stringify(polygons, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = Object.assign(document.createElement('a'), {
      href: url,
      download: `polygons_${new Date().toISOString().split('T')[0]}.json`
    });
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  importPolygons: async (file: File) => {
    const content = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });

    const polygons = JSON.parse(content);
    const features = polygons.map((coords: number[][], i: number) => ({
      type: 'Feature' as const,
      geometry: { type: 'Polygon' as const, coordinates: [coords] },
      properties: { id: i }
    }));

    set({ polygonFeatures: features, selectedFeatureIndex: null });

    const { files } = useBinaryFilesStore.getState();
    if (!files.length) return;

    const allPoints: any[] = [];
    const tilePromises = files
      .filter((f: any) => f.name.includes('.bin'))
      .map(async (file: any) => {
        const tileData = (await loadTileData(file)) as any;
        return (
          tileData?.pointsData?.filter((point: any) =>
            polygons.some((coords: number[][]) => isPointInPolygon([point.position[0], point.position[1]], coords))
          ) || []
        );
      });

    (await Promise.all(tilePromises)).forEach((points) => allPoints.push(...points));
    useTranscriptLayerStore.getState().setSelectedPoints(removeDuplicates(allPoints));
  }
}));
