import * as protobuf from 'protobufjs';
import { TranscriptFileSchema } from '../../schemas/transcriptaFile.schema';
import { useTranscriptLayerStore } from '../TranscriptLayerStore';
import { useCellSegmentationLayerStore } from '../CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useViewerStore } from '../ViewerStore';
import { PolygonFeature, Point2D, LineSegment, IntersectionResult, BoundingBox } from './PolygonDrawingStore.types';
import { CellsExportData, TranscriptsExportData } from '../../components/PolygonImportExport/PolygonImportExport.types';

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

export const getPolygonBoundingBox = (coordinates: number[][]): BoundingBox => {
  let minX = coordinates[0][0];
  let maxX = coordinates[0][0];
  let minY = coordinates[0][1];
  let maxY = coordinates[0][1];

  for (let i = 1; i < coordinates.length; i++) {
    const [x, y] = coordinates[i];

    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  return {
    left: minX,
    top: minY,
    right: maxX,
    bottom: maxY
  };
};

// Check if point is inside a rectangular bounding box
export const isPointWitinBoundingBox = (point: [number, number], boundingBox: BoundingBox): boolean => {
  return (
    point[0] > boundingBox.left &&
    point[0] < boundingBox.right &&
    point[1] > boundingBox.top &&
    point[1] < boundingBox.bottom
  );
};

// Check if polygon is fullt inside a rectangular bounding box
export const isPolygonWithinBoundingBox = (cellVertices: number[], boundingBox: BoundingBox): boolean => {
  for (let i = 0; i < cellVertices.length; i += 2) {
    if (!isPointWitinBoundingBox([cellVertices[i], cellVertices[i + 1]], boundingBox)) {
      return false;
    }
  }
  return true;
};

// Ray Casting Algorithm with early exit optimization: Casts a horizontal ray from the point to infinity and counts edge intersections.
// Odd count = inside, even count = outside.
export const isPointInSelection = (point: [number, number], coordinates: number[][], boundingBox: BoundingBox) => {
  if (!isPointWitinBoundingBox(point, boundingBox)) {
    return false;
  }

  // Ray casting algorithm
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

export const isPolygonInSelection = (cellVertices: number[], coordinates: number[][], boundingBox: BoundingBox) => {
  if (!cellVertices || cellVertices.length < 6) return false;

  // Check each vertex of the cell polygon
  for (let i = 0; i < cellVertices.length; i += 2) {
    const x = cellVertices[i];
    const y = cellVertices[i + 1];

    if (!isPointInSelection([x, y], coordinates, boundingBox)) {
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
    const updatedFeature: PolygonFeature = {
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
        const data = protobuf.Root.fromJSON(TranscriptFileSchema)
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

const generateExportJsonFilename = (type: string): string => {
  const viewerSource = useViewerStore.getState().source;
  const ometiffName = viewerSource?.description?.replace(/\.(ome\.tiff?|tiff?|zarr)$/i, '') || 'export';
  const date = new Date().toISOString().split('T')[0];
  return `${ometiffName}_${type}_${date}.json`;
};

export const exportPolygonsWithCells = (polygonFeatures: PolygonFeature[], includeGenes: boolean) => {
  const { selectedCells, segmentationMetadata } = useCellSegmentationLayerStore.getState();

  const exportData: CellsExportData = {};

  polygonFeatures.forEach((feature) => {
    const polygonId = feature.properties?.polygonId || 1;
    const roiName = `ROI_${polygonId}`;
    const coordinates = feature.geometry.coordinates[0];

    exportData[roiName] = {
      coordinates: coordinates.map((coord: number[]) => coord as [number, number]),
      cells:
        selectedCells
          .find((selection) => selection.roiId === polygonId)
          ?.data.map((entry) => {
            const { nonzeroGeneIndices, nonzeroGeneValues, proteinValues, ...exportObj } = entry;
            return {
              ...exportObj,
              ...(segmentationMetadata?.proteinNames
                ? {
                    protein: Object.fromEntries(
                      segmentationMetadata.proteinNames.map((name, index) => [name, entry.proteinValues[index]])
                    )
                  }
                : {}),
              ...(segmentationMetadata?.geneNames && includeGenes
                ? {
                    transcript: Object.fromEntries(
                      entry.nonzeroGeneIndices.map((geneIndex, index) => [
                        segmentationMetadata.geneNames[geneIndex],
                        entry.nonzeroGeneValues[index]
                      ])
                    )
                  }
                : {})
            };
          }) || [],
      polygonId: polygonId
    };
  });

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement('a'), {
    href: url,
    download: generateExportJsonFilename('segmentation')
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

    exportData[roiName] = {
      coordinates: coordinates.map((coord: number[]) => coord as [number, number]),
      transcripts: selectedPoints.find((selection) => selection.roiId === polygonId)?.data || [],
      polygonId: polygonId
    };
  });

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement('a'), {
    href: url,
    download: generateExportJsonFilename('transcripts')
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
    const currentPolygon = currentFeatures[i];
    const currentPolygonId = currentPolygon.properties?.polygonId;

    const previousPolygon = previousFeatures.find((p) => p.properties?.polygonId === currentPolygonId);

    if (!previousPolygon) {
      // New polygon at this index
      editedPolygon = currentPolygon;
      editedPolygonIndex = currentPolygonId ?? i;
      break;
    }

    // Compare coordinates with tolerance for floating point precision
    const coordsChanged = currentPolygon.geometry.coordinates[0].some((coord: number[], coordIndex: number) => {
      const prevCoord = previousPolygon.geometry.coordinates[0][coordIndex];
      if (!prevCoord) return true;

      const tolerance = 0.0001;
      return Math.abs(coord[0] - prevCoord[0]) > tolerance || Math.abs(coord[1] - prevCoord[1]) > tolerance;
    });

    if (coordsChanged) {
      editedPolygon = currentPolygon;
      editedPolygonIndex = currentPolygonId ?? i;
      break;
    }
  }

  // If no specific polygon found, assume the last one was edited (fallback)
  if (!editedPolygon && currentFeatures.length > 0) {
    editedPolygon = currentFeatures[currentFeatures.length - 1];
    editedPolygonIndex = editedPolygon.properties?.polygonId ?? currentFeatures.length - 1;
    console.warn('Could not identify specific edited polygon, using last polygon as fallback');
  }

  return { editedPolygon, editedPolygonIndex };
};
