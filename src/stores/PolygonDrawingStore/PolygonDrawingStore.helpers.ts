import * as protobuf from 'protobufjs';
import { TranscriptSchema } from '../../layers/transcript-layer/transcript-schema';
import { SingleMask } from '../../shared/types';
import { useTranscriptLayerStore } from '../TranscriptLayerStore';
import { useBinaryFilesStore } from '../BinaryFilesStore';
import { useCellSegmentationLayerStore } from '../CellSegmentationLayerStore/CellSegmentationLayerStore';
import { PolygonFeature, Point2D, LineSegment, IntersectionResult } from './PolygonDrawingStore.types';
import {
  ExportedCellData,
  CellsExportData,
  TranscriptsExportData,
  ExportedTranscriptData
} from '../../components/PolygonImportExport/PolygonImportExport.types';

// Epsilon for floating point comparisons
const EPSILON = 1e-10;

// Check if two points are equal within epsilon tolerance
const pointsEqual = (p1: Point2D, p2: Point2D): boolean => {
  return Math.abs(p1[0] - p2[0]) < EPSILON && Math.abs(p1[1] - p2[1]) < EPSILON;
};

// Calculate cross product for orientation test
const crossProduct = (a: Point2D, b: Point2D, c: Point2D): number => {
  return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
};

// Check if point lies on line segment
const pointOnSegment = (p: Point2D, seg: LineSegment): boolean => {
  const { start, end } = seg;

  if (Math.abs(crossProduct(start, end, p)) > EPSILON) return false;

  // Check if point is within segment bounds
  const minX = Math.min(start[0], end[0]);
  const maxX = Math.max(start[0], end[0]);
  const minY = Math.min(start[1], end[1]);
  const maxY = Math.max(start[1], end[1]);

  return p[0] >= minX - EPSILON && p[0] <= maxX + EPSILON && p[1] >= minY - EPSILON && p[1] <= maxY + EPSILON;
};

// Check if two line segments intersect
const segmentsIntersect = (seg1: LineSegment, seg2: LineSegment): boolean => {
  const { start: p1, end: q1 } = seg1;
  const { start: p2, end: q2 } = seg2;

  // Skip if segments share an endpoint
  if (pointsEqual(p1, p2) || pointsEqual(p1, q2) || pointsEqual(q1, p2) || pointsEqual(q1, q2)) {
    return false;
  }

  const d1 = crossProduct(p2, q2, p1);
  const d2 = crossProduct(p2, q2, q1);
  const d3 = crossProduct(p1, q1, p2);
  const d4 = crossProduct(p1, q1, q2);

  // Check for proper intersection
  if (
    ((d1 > EPSILON && d2 < -EPSILON) || (d1 < -EPSILON && d2 > EPSILON)) &&
    ((d3 > EPSILON && d4 < -EPSILON) || (d3 < -EPSILON && d4 > EPSILON))
  ) {
    return true;
  }

  // Check for collinear intersection
  if (Math.abs(d1) < EPSILON && pointOnSegment(p1, seg2)) return true;
  if (Math.abs(d2) < EPSILON && pointOnSegment(q1, seg2)) return true;
  if (Math.abs(d3) < EPSILON && pointOnSegment(p2, seg1)) return true;
  if (Math.abs(d4) < EPSILON && pointOnSegment(q2, seg1)) return true;

  return false;
};

// Convert polygon coordinates to line segments
const polygonToSegments = (coordinates: number[][]): LineSegment[] => {
  const segments: LineSegment[] = [];

  for (let i = 0; i < coordinates.length; i++) {
    const start: Point2D = [coordinates[i][0], coordinates[i][1]];
    const end: Point2D = [coordinates[(i + 1) % coordinates.length][0], coordinates[(i + 1) % coordinates.length][1]];

    if (!pointsEqual(start, end)) {
      segments.push({ start, end, id: i });
    }
  }

  return segments;
};

// Detect self-intersections in polygon - O(n²) algorithm
export const checkPolygonSelfIntersection = (coordinates: number[][]): IntersectionResult => {
  if (coordinates.length < 3) {
    return { hasIntersection: false };
  }

  const segments = polygonToSegments(coordinates);

  if (segments.length < 4) {
    return { hasIntersection: false };
  }

  // Check all pairs of non-adjacent segments
  for (let i = 0; i < segments.length; i++) {
    for (let j = i + 2; j < segments.length; j++) {
      // Skip adjacent segments (first and last are also adjacent)
      if (i === 0 && j === segments.length - 1) {
        continue;
      }

      if (segmentsIntersect(segments[i], segments[j])) {
        // Early exit on first intersection found - optimization
        return { hasIntersection: true };
      }
    }
  }

  return { hasIntersection: false };
};

// Check if polygon feature has self-intersections
export const checkPolygonSelfIntersections = (feature: PolygonFeature): IntersectionResult => {
  if (!feature.geometry || !feature.geometry.coordinates || !feature.geometry.coordinates[0]) {
    return { hasIntersection: false };
  }

  const coordinates = feature.geometry.coordinates[0];
  return checkPolygonSelfIntersection(coordinates);
};

// Ray Casting Algorithm with early exit optimization: Casts a horizontal ray from the point to infinity and counts edge intersections.
// Odd count = inside, even count = outside.
export const isPointInPolygon = (point: [number, number], coordinates: number[][]) => {
  let inside = false;
  const [x, y] = point;

  // Quick bounds check - if point is outside polygon bounding box
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;

  // Calculate bounding box in single pass
  for (let i = 0; i < coordinates.length; i++) {
    const [xi, yi] = coordinates[i];
    if (xi < minX) minX = xi;
    if (xi > maxX) maxX = xi;
    if (yi < minY) minY = yi;
    if (yi > maxY) maxY = yi;
  }

  // Early exit if point is outside bounding box
  if (x < minX || x > maxX || y < minY || y > maxY) {
    return false;
  }

  // Ray casting algorithm
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

  // Pre-calculate polygon bounding box once for all vertex checks
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;

  for (let i = 0; i < coordinates.length; i++) {
    const [xi, yi] = coordinates[i];
    if (xi < minX) minX = xi;
    if (xi > maxX) maxX = xi;
    if (yi < minY) minY = yi;
    if (yi > maxY) maxY = yi;
  }

  // Check each vertex of the cell polygon
  for (let i = 0; i < cellVertices.length; i += 2) {
    const x = cellVertices[i];
    const y = cellVertices[i + 1];

    // Early exit if vertex is outside bounding box
    if (x < minX || x > maxX || y < minY || y > maxY) {
      return false;
    }

    // Use ray casting for precise check
    let inside = false;
    for (let j = 0, k = coordinates.length - 1; j < coordinates.length; k = j++) {
      const [xi, yi] = coordinates[j];
      const [xj, yj] = coordinates[k];

      if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
        inside = !inside;
      }
    }

    if (!inside) {
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

export const getHighestPolygonId = (features: PolygonFeature[]): number => {
  const existingIds = features
    .map((feature) => feature.properties?.polygonId)
    .filter((id) => typeof id === 'number' && id > 0) as number[];

  return existingIds.length > 0 ? Math.max(...existingIds) : 0;
};

export const updatePolygonFeaturesWithIds = (features: PolygonFeature[], _nextId: number) => {
  const maxExistingId = getHighestPolygonId(features);
  let currentMaxId = maxExistingId;

  const featuresWithIds = features.map((feature) => {
    // If feature already has a valid polygonId, keep it
    if (
      feature.properties?.polygonId &&
      typeof feature.properties.polygonId === 'number' &&
      feature.properties.polygonId > 0
    ) {
      return feature;
    }

    // Otherwise assign next available ID
    currentMaxId += 1;
    const updatedFeature = {
      ...feature,
      properties: {
        ...feature.properties,
        polygonId: currentMaxId
      }
    };
    return updatedFeature;
  });

  return {
    featuresWithIds,
    nextPolygonId: currentMaxId + 1
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

  const exportData: CellsExportData = {};

  polygonFeatures.forEach((feature) => {
    const polygonId = feature.properties?.polygonId || 1;
    const roiName = `ROI_${polygonId}`;
    const coordinates = feature.geometry.coordinates[0];

    const cellsInPolygon: ExportedCellData[] = [];

    if (cellMasksData && Array.isArray(cellMasksData)) {
      for (const cellMask of cellMasksData) {
        if (
          cellMask.vertices &&
          cellMask.vertices.length > 0 &&
          checkCellPolygonInDrawnPolygon(cellMask.vertices, coordinates)
        ) {
          const cellData: ExportedCellData = {
            cell_id: cellMask.cellId,
            totalCounts: parseInt(cellMask.totalCounts) || 0,
            totalGenes: parseInt(cellMask.totalGenes) || 0,
            area: parseFloat(cellMask.area) || 0,
            clusterId: cellMask.clusterId || '',
            umapX: cellMask.umapValues?.umapX || 0,
            umapY: cellMask.umapValues?.umapY || 0,
            vertices: cellMask.vertices || [],
            color: cellMask.color || []
          };

          // Add protein data
          if (cellMask.proteins) {
            Object.entries(cellMask.proteins).forEach(([proteinName, value]) => {
              cellData[proteinName] = value;
            });
          }

          cellsInPolygon.push(cellData);
        }
      }
    }

    exportData[roiName] = {
      coordinates: coordinates.map((coord: number[]) => coord as [number, number]),
      cells: cellsInPolygon,
      polygonId: polygonId
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

  const exportData: TranscriptsExportData = {};

  polygonFeatures.forEach((feature) => {
    const polygonId = feature.properties?.polygonId || 1;
    const roiName = `ROI_${polygonId}`;
    const coordinates = feature.geometry.coordinates[0];

    const transcriptsInPolygon: ExportedTranscriptData[] = [];
    const geneCountMap: Map<string, number> = new Map();

    if (selectedPoints && Array.isArray(selectedPoints)) {
      // First pass: collect transcripts and count genes
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

      // Second pass: add transcripts with count data
      for (const transcript of selectedPoints) {
        if (
          transcript.position &&
          transcript.position.length >= 2 &&
          isPointInPolygon([transcript.position[0], transcript.position[1]], coordinates)
        ) {
          const geneName = transcript.geneName || 'unknown';
          transcriptsInPolygon.push({
            gene_name: geneName,
            count: geneCountMap.get(geneName) || 0,
            position: transcript.position || [],
            color: transcript.color || [],
            cellId: transcript.cellId || ''
          });
        }
      }
    }

    exportData[roiName] = {
      coordinates: coordinates.map((coord: number[]) => coord as [number, number]),
      transcripts: transcriptsInPolygon,
      polygonId: polygonId
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

export const findEditedPolygon = (
  currentFeatures: PolygonFeature[],
  previousFeatures: PolygonFeature[]
): { editedPolygon: PolygonFeature | null; editedPolygonIndex: number } => {
  let editedPolygon: PolygonFeature | null = null;
  let editedPolygonIndex = -1;

  // First try to find changed polygon by comparing coordinates
  for (let i = 0; i < currentFeatures.length; i++) {
    const polygon = currentFeatures[i];
    const previousPolygon = previousFeatures[i];

    if (!previousPolygon) {
      // New polygon at this index
      editedPolygon = polygon;
      editedPolygonIndex = i;
      break;
    }

    // Compare coordinates with tolerance for floating point precision
    const coordsChanged = polygon.geometry.coordinates[0].some((coord: number[], coordIndex: number) => {
      const prevCoord = previousPolygon.geometry.coordinates[0][coordIndex];
      if (!prevCoord) return true;

      const tolerance = 0.0001;
      return Math.abs(coord[0] - prevCoord[0]) > tolerance || Math.abs(coord[1] - prevCoord[1]) > tolerance;
    });

    if (coordsChanged) {
      editedPolygon = polygon;
      editedPolygonIndex = i;
      break;
    }
  }

  // If no specific polygon found, assume the last one was edited (fallback)
  if (!editedPolygon && currentFeatures.length > 0) {
    editedPolygon = currentFeatures[currentFeatures.length - 1];
    editedPolygonIndex = currentFeatures.length - 1;
    console.warn('Could not identify specific edited polygon, using last polygon as fallback');
  }

  return { editedPolygon, editedPolygonIndex };
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

  let polygonsWithData: Array<{ coordinates: number[][]; polygonId?: number }>;

  if (isNewFormat) {
    // New format: extract coordinates and polygonId from ROI structure
    polygonsWithData = Object.values(importedData).map((roi: any) => ({
      coordinates: roi.coordinates,
      polygonId: roi.polygonId
    }));
  } else {
    // Legacy format: array of coordinates without polygonId
    polygonsWithData = importedData.map((coords: number[][]) => ({
      coordinates: coords
    }));
  }

  const features = polygonsWithData.map((polygonData, i: number) => ({
    type: 'Feature' as const,
    geometry: { type: 'Polygon' as const, coordinates: [polygonData.coordinates] },
    properties: {
      id: i,
      polygonId: polygonData.polygonId || i + 1 // Use original ID if available, otherwise sequential
    }
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
            polygonsWithData.some((polygonData) => isPointInPolygon(point.position, polygonData.coordinates))
          ) || []
        );
      });

    (await Promise.all(tilePromises)).forEach((points) => allPoints.push(...points));
    useTranscriptLayerStore.getState().setSelectedPoints(removeDuplicates(allPoints));
  }

  const { cellMasksData } = useCellSegmentationLayerStore.getState();
  if (cellMasksData && polygonsWithData.length > 0) {
    try {
      const cellPolygonsInDrawnPolygons: SingleMask[] = [];

      for (const cellMask of cellMasksData) {
        if (
          cellMask.vertices &&
          polygonsWithData.some((polygonData) =>
            checkCellPolygonInDrawnPolygon(cellMask.vertices, polygonData.coordinates)
          )
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
