import * as protobuf from 'protobufjs';
import { TranscriptSchema } from '../../layers/transcript-layer/transcript-schema';
import { SingleMask } from '../../shared/types';
import { useTranscriptLayerStore } from '../TranscriptLayerStore';
import { useBinaryFilesStore } from '../BinaryFilesStore';
import { useCellSegmentationLayerStore } from '../CellSegmentationLayerStore/CellSegmentationLayerStore';
import { PolygonFeature } from './PolygonDrawingStore.types';

// Ray Casting Algorithm: Casts a horizontal ray from the point to infinity and counts edge intersections.
// Odd count = inside, even count = outside.
export const isPointInPolygon = (point: [number, number], coordinates: number[][]) => {
  let inside = false;
  const [x, y] = point;

  for (let i = 0, j = coordinates.length - 1; i < coordinates.length; j = i++) {
    const [xi, yi] = coordinates[i];
    const [xj, yj] = coordinates[j];

    // Check if ray intersects edge: edge crosses y-level AND point is left of intersection
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
};

export const checkCellPolygonInDrawnPolygon = (cellVertices: number[], coordinates: number[][]) => {
  if (!cellVertices || cellVertices.length < 6) return false;

  for (let i = 0; i < cellVertices.length; i += 2) {
    const point: [number, number] = [cellVertices[i], cellVertices[i + 1]];
    if (!isPointInPolygon(point, coordinates)) {
      return false;
    }
  }

  return true;
};

export const removeDuplicates = (points: any[]) => {
  const seen = new Set();
  return points.filter((point) => {
    if (!point?.position?.[0]) return false;
    const key = `${point.position[0]},${point.position[1]}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export const updatePolygonFeaturesWithIds = (features: PolygonFeature[], _nextId: number) => {
  const featuresWithIds = features.map((feature, index) => {
    const updatedFeature = {
      ...feature,
      properties: {
        ...feature.properties,
        polygonId: index + 1
      }
    };
    return updatedFeature;
  });

  return {
    featuresWithIds,
    nextPolygonId: features.length + 1
  };
};

export const loadTileData = (file: File) => {
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

export const exportPolygonsWithCells = (polygonFeatures: PolygonFeature[]) => {
  const { cellMasksData } = useCellSegmentationLayerStore.getState();

  const exportData: Record<
    string,
    { coordinates: [number, number][]; cells: { cell_id: string; totalCounts: number }[] }
  > = {};

  polygonFeatures.forEach((feature) => {
    const polygonId = feature.properties?.polygonId || 1;
    const roiName = `ROI_${polygonId}`;
    const coordinates = feature.geometry.coordinates[0];

    const cellsInPolygon: { cell_id: string; totalCounts: number }[] = [];

    if (cellMasksData && Array.isArray(cellMasksData)) {
      for (const cellMask of cellMasksData) {
        if (
          cellMask.vertices &&
          cellMask.vertices.length > 0 &&
          checkCellPolygonInDrawnPolygon(cellMask.vertices, coordinates)
        ) {
          cellsInPolygon.push({
            cell_id: cellMask.cellId,
            totalCounts: parseInt(cellMask.totalCounts) || 0
          });
        }
      }
    }

    exportData[roiName] = {
      coordinates: coordinates.map((coord: number[]) => coord as [number, number]),
      cells: cellsInPolygon
    };
  });

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement('a'), {
    href: url,
    download: `polygon_data_${new Date().toISOString().split('T')[0]}.json`
  });
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportPolygonsWithTranscripts = (polygonFeatures: PolygonFeature[]) => {
  const { selectedPoints } = useTranscriptLayerStore.getState();

  const exportData: Record<
    string,
    { coordinates: [number, number][]; transcripts: { gene_name: string; count: number }[] }
  > = {};

  polygonFeatures.forEach((feature) => {
    const polygonId = feature.properties?.polygonId || 1;
    const roiName = `ROI_${polygonId}`;
    const coordinates = feature.geometry.coordinates[0];

    const geneCountMap: Map<string, number> = new Map();

    if (selectedPoints && Array.isArray(selectedPoints)) {
      for (const transcript of selectedPoints) {
        if (
          transcript.position &&
          transcript.position.length >= 2 &&
          isPointInPolygon([transcript.position[0], transcript.position[1]], coordinates)
        ) {
          const geneName = transcript.geneName || 'unknown';
          geneCountMap.set(geneName, (geneCountMap.get(geneName) || 0) + 1);
        }
      }
    }

    const transcriptsInPolygon = Array.from(geneCountMap.entries()).map(([gene_name, count]) => ({
      gene_name,
      count
    }));

    exportData[roiName] = {
      coordinates: coordinates.map((coord: number[]) => coord as [number, number]),
      transcripts: transcriptsInPolygon
    };
  });

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement('a'), {
    href: url,
    download: `polygon_data_${new Date().toISOString().split('T')[0]}.json`
  });
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const importPolygons = async (file: File) => {
  const content = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsText(file);
  });

  const importedData = JSON.parse(content);

  // Check if it's the new format (with ROI structure) or legacy format (array of coordinates)
  const isNewFormat =
    typeof importedData === 'object' &&
    !Array.isArray(importedData) &&
    Object.keys(importedData).some((key) => key.startsWith('ROI_'));

  let polygons: number[][][];

  if (isNewFormat) {
    // New format: extract coordinates from ROI structure
    polygons = Object.values(importedData).map((roi: any) => roi.coordinates);
  } else {
    // Legacy format: array of coordinates
    polygons = importedData;
  }

  const features = polygons.map((coords: number[][], i: number) => ({
    type: 'Feature' as const,
    geometry: { type: 'Polygon' as const, coordinates: [coords] },
    properties: { id: i, polygonId: i + 1 }
  }));

  const { files } = useBinaryFilesStore.getState();
  if (files.length > 0) {
    const allPoints: any[] = [];
    const tilePromises = files
      .filter((f: any) => f.name.includes('.bin'))
      .map(async (file: any) => {
        const tileData = (await loadTileData(file)) as any;
        return (
          tileData?.pointsData?.filter((point: any) =>
            polygons.some((coords: number[][]) => isPointInPolygon(point.position, coords))
          ) || []
        );
      });

    (await Promise.all(tilePromises)).forEach((points) => allPoints.push(...points));
    useTranscriptLayerStore.getState().setSelectedPoints(removeDuplicates(allPoints));
  }

  const { cellMasksData } = useCellSegmentationLayerStore.getState();
  if (cellMasksData && polygons.length > 0) {
    try {
      const cellPolygonsInDrawnPolygons: SingleMask[] = [];

      for (const cellMask of cellMasksData) {
        if (
          cellMask.vertices &&
          polygons.some((coords: number[][]) => checkCellPolygonInDrawnPolygon(cellMask.vertices, coords))
        ) {
          cellPolygonsInDrawnPolygons.push(cellMask);
        }
      }

      useCellSegmentationLayerStore.getState().setSelectedCells(cellPolygonsInDrawnPolygons);
    } catch (error) {
      console.error('Error processing cell masks during import:', error);
    }
  }

  return features;
};
