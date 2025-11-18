import * as protobuf from 'protobufjs';
import { TranscriptFileSchema } from '../../../schemas/transcriptaFile.schema';
import { SingleMask } from '../../../shared/types';
import { MAX_TRANSCRIPT_POINTS_LIMIT } from '../../../shared/constants';
import type {
  PolygonPointData,
  PolygonTileData,
  PolygonWorkerMessage,
  PolygonWorkerResponse
} from './polygonDetectionWorker.types';
import { BoundingBox, PolygonFeature } from '../../../stores/PolygonDrawingStore/PolygonDrawingStore.types';
import { LayerConfig } from '../../../stores/BinaryFilesStore/BinaryFilesStore.types';
import {
  getPolygonBoundingBox,
  isPointInSelection,
  isPolygonInSelection,
  isPolygonWithinBoundingBox
} from '../../../stores/PolygonDrawingStore/PolygonDrawingStore.helpers';

const loadTileData = async (file: File): Promise<PolygonTileData | null> => {
  try {
    const response = await fetch(URL.createObjectURL(file));
    const arrayBuffer = await response.arrayBuffer();

    const protoRoot = protobuf.Root.fromJSON(TranscriptFileSchema);
    const data = protoRoot.lookupType('TileData').decode(new Uint8Array(arrayBuffer)) as unknown as PolygonTileData;

    return data;
  } catch (error) {
    console.error(`❌ [Load ${file.name}] Error loading tile data:`, error);
    return null;
  }
};

const processBatch = async (batchFiles: Array<File>, polygon: PolygonFeature, polygonBoundingBox: BoundingBox) => {
  const batchPromises = batchFiles.map(async (file) => {
    try {
      const tileData = await loadTileData(file);
      if (tileData && Array.isArray(tileData.pointsData)) {
        const pointsFoundInTile = tileData.pointsData.filter((point: any) => {
          if (!point || !point.position || point.position.length < 2) {
            return false;
          }

          return isPointInSelection(point.position, polygon.geometry.coordinates[0], polygonBoundingBox);
        });

        return pointsFoundInTile;
      }
      return [];
    } catch (error) {
      console.error(`❌ Error processing tile: ${file.name}`, error);
      return [];
    }
  });

  return await Promise.all(batchPromises);
};

const detectPointsInPolygon = async (
  polygon: PolygonFeature,
  polygonBoundingBox: BoundingBox,
  files: File[],
  layerConfig: LayerConfig
) => {
  // Use the highest zoom level from layerConfig where all points are visible without clustering
  const maxZoomLevel = layerConfig.layers;
  // Calculate the tile size for the max zoom level
  const tileSize = layerConfig.tile_size / Math.pow(2, maxZoomLevel);

  const pointsInPolygon: PolygonPointData[] = [];
  const tileFileRegex = new RegExp(String.raw`${maxZoomLevel}\/(\d+)\/(\d+)\.bin$`, 'ig');

  const filesToProcess: Array<File> = [];

  // Filter out files from other zoom levels and for tiles that do not intersect the selection ploygon bounding box.
  for (const file of files) {
    const match = file.name.match(tileFileRegex);
    if (match) {
      const [_, x, y] = match[0].split('.')[0].split('/').map(Number);

      const tileCoords: BoundingBox = {
        left: tileSize * y,
        top: tileSize * x,
        right: tileSize * (y + 1),
        bottom: tileSize * (x + 1)
      };

      const intersects =
        tileCoords.left < polygonBoundingBox.right &&
        tileCoords.right > polygonBoundingBox.left &&
        tileCoords.bottom > polygonBoundingBox.top &&
        tileCoords.top < polygonBoundingBox.bottom;

      if (intersects) {
        filesToProcess.push(file);
      }
    }
  }

  // Process files in batches to avoid overwhelming the system
  const BATCH_SIZE = 20;
  const batches = [];

  for (let i = 0; i < filesToProcess.length; i += BATCH_SIZE) {
    batches.push(filesToProcess.slice(i, i + BATCH_SIZE));
  }

  const allPointArrays: any[] = [];
  let limitExceeded = false;

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];

    const batchResults = await processBatch(batch, polygon, polygonBoundingBox);
    allPointArrays.push(...batchResults);

    // Calculate total points found so far
    const currentTotal = allPointArrays.reduce((sum, arr) => sum + arr.length, 0);

    // Check if we exceeded the limit
    if (currentTotal > MAX_TRANSCRIPT_POINTS_LIMIT) {
      limitExceeded = true;
      console.warn(
        `[ROI Detection] Point limit exceeded: ${currentTotal.toLocaleString()} points found, limit is ${MAX_TRANSCRIPT_POINTS_LIMIT.toLocaleString()}`
      );
      break;
    }
  }

  // Avoid stack overflow by using concat or iterative push instead of spread operator
  // Only add points up to the limit
  let pointsAdded = 0;
  for (const pointArray of allPointArrays) {
    for (const point of pointArray) {
      if (pointsAdded >= MAX_TRANSCRIPT_POINTS_LIMIT) {
        break;
      }
      pointsInPolygon.push(point);
      pointsAdded++;
    }
    if (pointsAdded >= MAX_TRANSCRIPT_POINTS_LIMIT) {
      break;
    }
  }

  const countByGeneName: Record<string, number> = {};
  for (const point of pointsInPolygon) {
    const geneName = point.geneName || 'unknown';
    countByGeneName[geneName] = (countByGeneName[geneName] || 0) + 1;
  }

  return {
    pointsInPolygon: pointsInPolygon,
    pointCount: pointsInPolygon.length,
    geneDistribution: countByGeneName,
    limitExceeded
  };
};

const detectCellPolygonsInPolygon = async (
  polygon: PolygonFeature,
  polygonBoundingBox: BoundingBox,
  cellMasksData: SingleMask[]
) => {
  try {
    const cellPolygonsInDrawnPolygon: SingleMask[] = [];
    for (const cellMask of cellMasksData) {
      if (cellMask.vertices) {
        if (!isPolygonWithinBoundingBox(cellMask.vertices, polygonBoundingBox)) {
          continue;
        }

        if (isPolygonInSelection(cellMask.vertices, polygon.geometry.coordinates[0], polygonBoundingBox)) {
          cellPolygonsInDrawnPolygon.push(cellMask);
        }
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
    console.error(`❌ [Cell Detection] Error:`, error);
    throw new Error(`Error processing cell masks: ${error}`);
  }
};

onmessage = async (e: MessageEvent<PolygonWorkerMessage>) => {
  const { type, payload } = e.data;

  const polygonBoundingBox = getPolygonBoundingBox(payload.polygon.geometry.coordinates[0]);

  try {
    if (type === 'detectPointsInPolygon') {
      const result = await detectPointsInPolygon(
        payload.polygon,
        polygonBoundingBox,
        payload.files,
        payload.layerConfig
      );

      postMessage({
        type: 'pointsDetected',
        payload: {
          success: true,
          ...result
        }
      } as PolygonWorkerResponse);
    } else if (type === 'detectCellPolygonsInPolygon') {
      const result = await detectCellPolygonsInPolygon(payload.polygon, polygonBoundingBox, payload.cellMasksData);

      postMessage({
        type: 'cellPolygonsDetected',
        payload: {
          success: true,
          ...result
        }
      } as PolygonWorkerResponse);
    }
  } catch (error) {
    console.error(`💥 [Worker] Error:`, error);

    postMessage({
      type: 'error',
      payload: {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    } as PolygonWorkerResponse);
  }
};
