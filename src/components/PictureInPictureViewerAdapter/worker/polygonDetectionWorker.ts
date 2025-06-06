import * as protobuf from 'protobufjs';
import { CellMasksSchema } from '../../../layers/cell-masks-layer/cell-masks-schema';
import { TranscriptSchema } from '../../../layers/transcript-layer/transcript-schema';
import type { PolygonTileData, PolygonWorkerMessage, PolygonWorkerResponse } from './polygonDetectionWorker.types';

// Checks if a point is inside a polygon using ray-casting algorithm
const isPointInPolygon = (point: [number, number], polygon: any) => {
  const vertices = polygon.geometry.coordinates[0];
  let inside = false;
  const x = point[0],
    y = point[1];

  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i][0],
      yi = vertices[i][1];
    const xj = vertices[j][0],
      yj = vertices[j][1];

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
};

const checkPointInPolygon = (point: [number, number], polygon: any) => {
  return isPointInPolygon(point, polygon);
};

const checkCellPolygonInDrawnPolygon = (cellVertices: number[], drawnPolygon: any) => {
  if (!cellVertices || cellVertices.length < 6) return false;

  for (let i = 0; i < cellVertices.length; i += 2) {
    const point: [number, number] = [cellVertices[i], cellVertices[i + 1]];
    if (!isPointInPolygon(point, drawnPolygon)) {
      return false;
    }
  }

  return true;
};

const cleanupDuplicatePoints = (points: any[]): any[] => {
  if (!points || points.length <= 1) return points || [];

  const seen = new Set<string>();
  const uniquePoints: any[] = [];

  uniquePoints.length = Math.ceil(points.length * 0.7);
  uniquePoints.length = 0;

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    if (!point || !point.position || point.position.length < 2) continue;

    const key = point.position[0] + ',' + point.position[1];

    if (!seen.has(key)) {
      seen.add(key);
      uniquePoints.push(point);
    }
  }

  return uniquePoints;
};

const loadTileData = async (file: any): Promise<PolygonTileData | null> => {
  try {
    const response = await fetch(URL.createObjectURL(file));
    const arrayBuffer = await response.arrayBuffer();

    const protoRoot = protobuf.Root.fromJSON(TranscriptSchema);
    const data = protoRoot.lookupType('TileData').decode(new Uint8Array(arrayBuffer)) as unknown as PolygonTileData;

    return data;
  } catch (error) {
    console.error('Error loading tile data:', error);
    return null;
  }
};

const detectPointsInPolygon = async (polygon: any, files: any[]) => {
  const pointsInPolygon: any[] = [];
  const tileRegex = /\/(\d+)\/(\d+)\/(\d+)\.bin$/;
  const tilePromises: Promise<any>[] = [];

  for (const file of files) {
    const match = file.name.match(tileRegex);
    if (match) {
      const zoom = parseInt(match[1], 10);
      const x = parseInt(match[2], 10);
      const y = parseInt(match[3], 10);

      tilePromises.push(
        (async () => {
          try {
            const tileData = await loadTileData(file);

            if (tileData && Array.isArray(tileData.pointsData)) {
              const pointsFoundInTile = tileData.pointsData.filter((point: any) => {
                if (!point || !point.position || point.position.length < 2) return false;
                const pointPosition = [point.position[0], point.position[1]];
                return checkPointInPolygon(pointPosition as [number, number], polygon);
              });

              return pointsFoundInTile;
            }
            return [];
          } catch (error) {
            console.error(`Error processing tile ${zoom}/${y}/${x}:`, error);
            return [];
          }
        })()
      );
    }
  }

  const allPointArrays = await Promise.all(tilePromises);
  allPointArrays.forEach((pointArray) => {
    pointsInPolygon.push(...pointArray);
  });

  const uniquePointsInPolygon = cleanupDuplicatePoints(pointsInPolygon);

  const countByGeneName: Record<string, number> = {};
  for (const point of uniquePointsInPolygon) {
    const geneName = point.geneName || 'unknown';
    countByGeneName[geneName] = (countByGeneName[geneName] || 0) + 1;
  }

  return {
    pointsInPolygon: uniquePointsInPolygon,
    pointCount: uniquePointsInPolygon.length,
    geneDistribution: countByGeneName
  };
};

const detectCellPolygonsInPolygon = async (polygon: any, cellMasksData: Uint8Array) => {
  try {
    const protoRoot = protobuf.Root.fromJSON(CellMasksSchema);
    const decodedCellMasks = (protoRoot.lookupType('CellMasks').decode(cellMasksData) as any).cellMasks;

    const cellPolygonsInDrawnPolygon: any[] = [];

    for (const cellMask of decodedCellMasks) {
      if (cellMask.vertices && checkCellPolygonInDrawnPolygon(cellMask.vertices, polygon)) {
        cellPolygonsInDrawnPolygon.push({
          cellId: cellMask.cellId,
          clusterId: cellMask.clusterId,
          area: cellMask.area,
          totalCounts: cellMask.totalCounts,
          totalGenes: cellMask.totalGenes,
          vertices: cellMask.vertices,
          color: cellMask.color
        });
      }
    }

    const countByClusterId: Record<string, number> = {};
    for (const cellPolygon of cellPolygonsInDrawnPolygon) {
      const clusterId = cellPolygon.clusterId || 'unknown';
      countByClusterId[clusterId] = (countByClusterId[clusterId] || 0) + 1;
    }

    return {
      cellPolygonsInDrawnPolygon,
      cellPolygonCount: cellPolygonsInDrawnPolygon.length,
      cellClusterDistribution: countByClusterId
    };
  } catch (error) {
    throw new Error(`Error processing cell masks: ${error}`);
  }
};

onmessage = async (e: MessageEvent<PolygonWorkerMessage>) => {
  const { type, payload } = e.data;

  try {
    if (type === 'detectPointsInPolygon') {
      const result = await detectPointsInPolygon(payload.polygon, payload.files);

      postMessage({
        type: 'pointsDetected',
        payload: {
          success: true,
          ...result
        }
      } as PolygonWorkerResponse);
    } else if (type === 'detectCellPolygonsInPolygon') {
      const result = await detectCellPolygonsInPolygon(payload.polygon, payload.cellMasksData);

      postMessage({
        type: 'cellPolygonsDetected',
        payload: {
          success: true,
          ...result
        }
      } as PolygonWorkerResponse);
    }
  } catch (error) {
    postMessage({
      type: 'error',
      payload: {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    } as PolygonWorkerResponse);
  }
};
