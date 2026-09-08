import { SingleMask } from '../../../shared/types';
import { MAX_TRANSCRIPT_POINTS_LIMIT, ZARR_TILE_BATCH_SIZE } from '../../../shared/constants';
import type {
  PointsDetectionBatchResult,
  PolygonPointData,
  TileCoordinates,
  PolygonWorkerMessage,
  PolygonWorkerResponse
} from './polygonDetectionWorker.types';
import { BoundingBox, PolygonFeature } from '../../../stores/PolygonDrawingStore/PolygonDrawingStore.types';
import { LayerConfig } from '../../../stores/ZarrDataStore/ZarrDataStore.types';
import { ZarrDataSet } from '../../../utils/ZarrDataSet';
import {
  getPolygonBoundingBox,
  isPointInSelection
} from '../../../stores/PolygonDrawingStore/PolygonDrawingStore.helpers';

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
  invertedZ: number,
  countOnly: boolean = false
) => {
  const roiCoords = polygon.geometry.coordinates[0];
  const batchPromises = batchTiles.map(async ({ x, y }) => {
    try {
      const raw = await zarrDataSet.getTranscriptTileRawData(invertedZ, y, x);
      if (!raw) return countOnly ? 0 : [];
      const { cellIds, geneNames, positions, count } = raw;
      const gn = geneNames as any;

      if (countOnly) {
        let matched = 0;
        for (let i = 0; i < count; i++) {
          if (isPointInSelection([positions[i * 2], positions[i * 2 + 1]], roiCoords, polygonBoundingBox)) matched++;
        }
        return matched;
      }

      const matched: PolygonPointData[] = [];
      for (let i = 0; i < count; i++) {
        const px = positions[i * 2],
          py = positions[i * 2 + 1];
        if (isPointInSelection([px, py], roiCoords, polygonBoundingBox)) {
          matched.push({
            position: [px, py],
            cellId: String(cellIds[i]),
            geneName: gn.get ? gn.get(i) : String(gn[i])
          });
        }
      }
      return matched;
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
    const batchResults = await processBatch(batches[i], limitExceeded);

    let batchPointCount = 0;
    if (limitExceeded) {
      batchPointCount = (batchResults as number[]).reduce((sum, count) => sum + count, 0);
    } else {
      batchPointCount = (batchResults as PolygonPointData[][]).reduce((sum, arr) => sum + arr.length, 0);
    }

    const currentTotal = totalPointsFound + batchPointCount;
    if (!limitExceeded && currentTotal > MAX_TRANSCRIPT_POINTS_LIMIT) {
      limitExceeded = true;
      for (const result of batchResults as PolygonPointData[][]) {
        allPointArrays.push(result);
      }
      // Estimate total proportionally — avoid processing remaining batches just to count
      const estimatedTotal = Math.round(currentTotal * (batches.length / (i + 1)));
      totalPointsFound = estimatedTotal;
      console.warn(
        `[ROI Detection] Point limit exceeded at batch ${i + 1}/${batches.length}: ~${estimatedTotal.toLocaleString()} points estimated, limit is ${MAX_TRANSCRIPT_POINTS_LIMIT.toLocaleString()}`
      );
      break;
    }

    for (const result of batchResults as PolygonPointData[][]) {
      allPointArrays.push(result);
    }

    totalPointsFound = currentTotal;
  }

  return {
    allPointArrays,
    totalPointsFound,
    limitExceeded
  };
};

const detectPointsInPolygonFromZarr = async (
  polygon: PolygonFeature,
  polygonBoundingBox: BoundingBox,
  layerConfig: LayerConfig,
  zarrUrl: string
) => {
  const zarrDataSet = new ZarrDataSet(zarrUrl);
  // Prefetch once — prevents thundering herd where each tile in first batch fires a redundant HTTP request
  await zarrDataSet.fetchTranscriptLayerConfig();
  const tilesToProcess = getZarrIntersectingTileCoordinates(polygonBoundingBox, layerConfig);
  const tileBatches: TileCoordinates[][] = [];

  for (let i = 0; i < tilesToProcess.length; i += ZARR_TILE_BATCH_SIZE) {
    tileBatches.push(tilesToProcess.slice(i, i + ZARR_TILE_BATCH_SIZE));
  }

  // invertedZ = maxZoomLevel - maxZoomLevel = 0 — always use highest resolution tiles
  return runBatchedPointsDetection(tileBatches, (batch, countOnly) =>
    processZarrTileBatch(batch, zarrDataSet, polygon, polygonBoundingBox, 0, countOnly)
  );
};

const detectPointsInPolygon = async (
  polygon: PolygonFeature,
  polygonBoundingBox: BoundingBox,
  layerConfig: LayerConfig,
  zarrUrl?: string
) => {
  const pointsInPolygon: PolygonPointData[] = [];
  const { allPointArrays, totalPointsFound, limitExceeded } = zarrUrl
    ? await detectPointsInPolygonFromZarr(polygon, polygonBoundingBox, layerConfig, zarrUrl)
    : { allPointArrays: [], totalPointsFound: 0, limitExceeded: false };

  // Iterative push avoids stack overflow; gene distribution counted in same pass
  const countByGeneName: Record<string, number> = {};
  let pointsAdded = 0;
  for (const pointArray of allPointArrays) {
    for (const point of pointArray) {
      if (pointsAdded >= MAX_TRANSCRIPT_POINTS_LIMIT) {
        break;
      }
      pointsInPolygon.push(point);
      const geneName = point.geneName || 'unknown';
      countByGeneName[geneName] = (countByGeneName[geneName] || 0) + 1;
      pointsAdded++;
    }
    if (pointsAdded >= MAX_TRANSCRIPT_POINTS_LIMIT) {
      break;
    }
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
      if (isPointInSelection(cellMask.centroid, polygon.geometry.coordinates[0], polygonBoundingBox)) {
        cellPolygonsInDrawnPolygon.push(cellMask);
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
