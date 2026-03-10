import * as protobuf from 'protobufjs';
import axios from 'axios';
import { TranscriptFileSchema } from '../../../schemas/transcriptaFile.schema';
import { SingleMask } from '../../../shared/types';
import { MAX_TRANSCRIPT_POINTS_LIMIT } from '../../../shared/constants';
import type {
  PointsDetectionBatchResult,
  PolygonPointData,
  PolygonTileData,
  TileCoordinates,
  PolygonWorkerMessage,
  PolygonWorkerResponse
} from './polygonDetectionWorker.types';
import { BoundingBox, PolygonFeature } from '../../../stores/PolygonDrawingStore/PolygonDrawingStore.types';
import { LayerConfig } from '../../../stores/ZarrDataStore/ZarrDataStore.types';
import { ZarrDataSet } from '../../../utils/ZarrDataSet';
import {
  getPolygonBoundingBox,
  isPointInSelection,
  isPolygonInSelection,
  isPolygonWithinBoundingBox
} from '../../../stores/PolygonDrawingStore/PolygonDrawingStore.helpers';

const loadTileData = async (file: File): Promise<PolygonTileData | null> => {
  try {
    const response = await axios.get(URL.createObjectURL(file), { responseType: 'arraybuffer' });
    const arrayBuffer = response.data;

    const protoRoot = protobuf.Root.fromJSON(TranscriptFileSchema);
    const data = protoRoot.lookupType('TileData').decode(new Uint8Array(arrayBuffer)) as unknown as PolygonTileData;

    return data;
  } catch (error) {
    console.error(`[Load ${file.name}] Error loading tile data:`, error);
    return null;
  }
};

const processLegacyBatch = async (
  batchFiles: Array<File>,
  polygon: PolygonFeature,
  polygonBoundingBox: BoundingBox,
  countOnly: boolean = false
) => {
  const batchPromises = batchFiles.map(async (file) => {
    try {
      const tileData = await loadTileData(file);
      if (tileData && Array.isArray(tileData.pointsData)) {
        if (countOnly) {
          // Fast path: only count points without creating arrays
          let count = 0;
          for (let i = 0; i < tileData.pointsData.length; i++) {
            const point = tileData.pointsData[i];
            if (point && point.position && point.position.length >= 2) {
              if (
                isPointInSelection(
                  point.position as [number, number],
                  polygon.geometry.coordinates[0],
                  polygonBoundingBox
                )
              ) {
                count++;
              }
            }
          }
          return count;
        } else {
          // Regular path: collect points in arrays
          const pointsFoundInTile = tileData.pointsData.filter((point: any) => {
            if (!point || !point.position || point.position.length < 2) {
              return false;
            }

            return isPointInSelection(point.position, polygon.geometry.coordinates[0], polygonBoundingBox);
          });

          return pointsFoundInTile;
        }
      }
      return countOnly ? 0 : [];
    } catch (error) {
      console.error(`Error processing tile: ${file.name}`, error);
      return countOnly ? 0 : [];
    }
  });

  return await Promise.all(batchPromises);
};

const getZarrIntersectingTileCoordinates = (
  polygonBoundingBox: BoundingBox,
  layerConfig: LayerConfig
): TileCoordinates[] => {
  const p0TileWidth = layerConfig.tile_size / Math.max(1, Math.pow(2, layerConfig.layers));
  const p0TileHeight = layerConfig.tile_size / Math.max(1, Math.pow(2, layerConfig.layers));
  const maxTileX = Math.max(0, Math.ceil(layerConfig.layer_width / p0TileWidth) - 1);
  const maxTileY = Math.max(0, Math.ceil(layerConfig.layer_height / p0TileHeight) - 1);

  const startX = Math.max(0, Math.floor(polygonBoundingBox.left / p0TileWidth));
  const endX = Math.min(maxTileX, Math.floor(polygonBoundingBox.right / p0TileWidth));
  const startY = Math.max(0, Math.floor(polygonBoundingBox.top / p0TileHeight));
  const endY = Math.min(maxTileY, Math.floor(polygonBoundingBox.bottom / p0TileHeight));

  const tiles: TileCoordinates[] = [];
  for (let y = startY; y <= endY; y++) {
    for (let x = startX; x <= endX; x++) {
      tiles.push({ x, y });
    }
  }

  return tiles;
};

const processZarrTileBatch = async (
  batchTiles: TileCoordinates[],
  zarrDataSet: ZarrDataSet,
  polygon: PolygonFeature,
  polygonBoundingBox: BoundingBox,
  maxZoomLevel: number,
  countOnly: boolean = false
) => {
  const batchPromises = batchTiles.map(async ({ x, y }) => {
    try {
      const tileData = await zarrDataSet.getTranscriptTileData({ z: maxZoomLevel, y, x });
      if (tileData && Array.isArray(tileData.pointsData)) {
        if (countOnly) {
          let count = 0;
          for (let i = 0; i < tileData.pointsData.length; i++) {
            const point = tileData.pointsData[i];
            if (point && point.position && point.position.length >= 2) {
              if (
                isPointInSelection(
                  point.position as [number, number],
                  polygon.geometry.coordinates[0],
                  polygonBoundingBox
                )
              ) {
                count++;
              }
            }
          }
          return count;
        }

        const pointsFoundInTile = tileData.pointsData.filter((point) => {
          if (!point || !point.position || point.position.length < 2) {
            return false;
          }

          return isPointInSelection(point.position, polygon.geometry.coordinates[0], polygonBoundingBox);
        });

        return pointsFoundInTile;
      }
      return countOnly ? 0 : [];
    } catch (error) {
      console.error(`Error processing Zarr transcript tile [x:${x}, y:${y}]`, error);
      return countOnly ? 0 : [];
    }
  });

  return await Promise.all(batchPromises);
};

const runBatchedPointsDetection = async <T>(
  batches: T[][],
  processBatch: (batch: T[], countOnly: boolean) => Promise<Array<number | PolygonPointData[]>>
): Promise<PointsDetectionBatchResult> => {
  const allPointArrays: PolygonPointData[][] = [];
  let limitExceeded = false;
  let totalPointsFound = 0;

  for (let i = 0; i < batches.length; i++) {
    // After limit exceeded, use count-only mode for better performance
    const batchResults = await processBatch(batches[i], limitExceeded);

    let batchPointCount = 0;
    if (limitExceeded) {
      batchPointCount = (batchResults as number[]).reduce((sum, count) => sum + count, 0);
    } else {
      batchPointCount = (batchResults as PolygonPointData[][]).reduce((sum, arr) => sum + arr.length, 0);
    }

    const currentTotal = totalPointsFound + batchPointCount;
    // Check if we exceeded the limit
    if (!limitExceeded && currentTotal > MAX_TRANSCRIPT_POINTS_LIMIT) {
      limitExceeded = true;
      console.warn(
        `[ROI Detection] Point limit exceeded at batch ${i + 1}/${batches.length}: ${currentTotal.toLocaleString()} points found so far, limit is ${MAX_TRANSCRIPT_POINTS_LIMIT.toLocaleString()}`
      );
    }

    // Store points only if limit not exceeded (to save memory)
    if (!limitExceeded) {
      for (const result of batchResults as PolygonPointData[][]) {
        allPointArrays.push(result);
      }
    }

    totalPointsFound = currentTotal;
  }

  return {
    allPointArrays,
    totalPointsFound,
    limitExceeded
  };
};

const detectPointsInPolygonFromLegacyFiles = async (
  polygon: PolygonFeature,
  polygonBoundingBox: BoundingBox,
  files: File[],
  layerConfig: LayerConfig,
  maxZoomLevel: number
) => {
  // Calculate the tile size for the max zoom level
  const tileSize = layerConfig.tile_size / Math.pow(2, maxZoomLevel);
  const tileFileRegex = new RegExp(String.raw`${maxZoomLevel}\/(\d+)\/(\d+)\.bin$`, 'ig');
  const filesToProcess: File[] = [];

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

  const BATCH_SIZE = 20;
  const fileBatches: File[][] = [];
  // Process files in batches to avoid overwhelming the system
  for (let i = 0; i < filesToProcess.length; i += BATCH_SIZE) {
    fileBatches.push(filesToProcess.slice(i, i + BATCH_SIZE));
  }

  return runBatchedPointsDetection(fileBatches, (batch, countOnly) =>
    processLegacyBatch(batch, polygon, polygonBoundingBox, countOnly)
  );
};

const detectPointsInPolygonFromZarr = async (
  polygon: PolygonFeature,
  polygonBoundingBox: BoundingBox,
  layerConfig: LayerConfig,
  zarrUrl: string,
  maxZoomLevel: number
) => {
  const zarrDataSet = new ZarrDataSet(zarrUrl);
  const tilesToProcess = getZarrIntersectingTileCoordinates(polygonBoundingBox, layerConfig);
  const BATCH_SIZE = 20;
  const tileBatches: TileCoordinates[][] = [];

  for (let i = 0; i < tilesToProcess.length; i += BATCH_SIZE) {
    tileBatches.push(tilesToProcess.slice(i, i + BATCH_SIZE));
  }

  return runBatchedPointsDetection(tileBatches, (batch, countOnly) =>
    processZarrTileBatch(batch, zarrDataSet, polygon, polygonBoundingBox, maxZoomLevel, countOnly)
  );
};

const detectPointsInPolygon = async (
  polygon: PolygonFeature,
  polygonBoundingBox: BoundingBox,
  files: File[],
  layerConfig: LayerConfig,
  zarrUrl?: string
) => {
  // Use the highest zoom level from layerConfig where all points are visible without clustering
  const maxZoomLevel = layerConfig.layers;
  const pointsInPolygon: PolygonPointData[] = [];
  const { allPointArrays, totalPointsFound, limitExceeded } =
    files.length > 0
      ? await detectPointsInPolygonFromLegacyFiles(polygon, polygonBoundingBox, files, layerConfig, maxZoomLevel)
      : zarrUrl
        ? await detectPointsInPolygonFromZarr(polygon, polygonBoundingBox, layerConfig, zarrUrl, maxZoomLevel)
        : { allPointArrays: [], totalPointsFound: 0, limitExceeded: false };

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

  let suggestedReductionPercent: number | undefined;
  if (limitExceeded && totalPointsFound > 0) {
    const ratio = MAX_TRANSCRIPT_POINTS_LIMIT / totalPointsFound;
    suggestedReductionPercent = Math.round((1 - ratio) * 100);
  }

  return {
    pointsInPolygon: pointsInPolygon,
    pointCount: pointsInPolygon.length,
    geneDistribution: countByGeneName,
    limitExceeded,
    totalPointsFound: limitExceeded ? totalPointsFound : undefined,
    suggestedReductionPercent
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
    console.error(`[Cell Detection] Error:`, error);
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
        payload.layerConfig,
        payload.zarrUrl
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
    console.error(`[Worker] Error:`, error);

    postMessage({
      type: 'error',
      payload: {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      }
    } as PolygonWorkerResponse);
  }
};
