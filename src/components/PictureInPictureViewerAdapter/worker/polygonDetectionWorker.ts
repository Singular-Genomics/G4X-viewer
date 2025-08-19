import * as protobuf from 'protobufjs';
import { TranscriptSchema } from '../../../layers/transcript-layer/transcript-schema';
import { SingleMask } from '../../../shared/types';
import type {
  PolygonPointData,
  PolygonTileData,
  PolygonWorkerMessage,
  PolygonWorkerResponse
} from './polygonDetectionWorker.types';
import { PolygonFeature } from '../../../stores/PolygonDrawingStore/PolygonDrawingStore.types';
import { LayerConfig } from '../../../stores/BinaryFilesStore/BinaryFilesStore.types';
import {
  isPointInPolygon,
  checkCellPolygonInDrawnPolygon
} from '../../../stores/PolygonDrawingStore/PolygonDrawingStore.helpers';

const checkPointInPolygon = (point: [number, number], polygon: PolygonFeature) => {
  return isPointInPolygon(point, polygon.geometry.coordinates[0]);
};

const checkCellPolygonInDrawnPolygonWrapper = (cellVertices: number[], drawnPolygon: PolygonFeature) => {
  return checkCellPolygonInDrawnPolygon(cellVertices, drawnPolygon.geometry.coordinates[0]);
};

const loadTileData = async (file: File): Promise<PolygonTileData | null> => {
  try {
    const response = await fetch(URL.createObjectURL(file));
    const arrayBuffer = await response.arrayBuffer();

    const protoRoot = protobuf.Root.fromJSON(TranscriptSchema);
    const data = protoRoot.lookupType('TileData').decode(new Uint8Array(arrayBuffer)) as unknown as PolygonTileData;

    return data;
  } catch (error) {
    console.error(`❌ [Load ${file.name}] Error loading tile data:`, error);
    return null;
  }
};

const processBatch = async (
  batchFiles: Array<{ file: File; zoom: number; x: number; y: number }>,
  polygon: PolygonFeature
) => {
  const batchPromises = batchFiles.map(async ({ file, zoom, x, y }) => {
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
      console.error(`❌ Error processing tile ${zoom}/${y}/${x}:`, error);
      return [];
    }
  });

  return await Promise.all(batchPromises);
};

const detectPointsInPolygon = async (polygon: PolygonFeature, files: File[], layerConfig: LayerConfig) => {
  const startTime = performance.now();

  const pointsInPolygon: PolygonPointData[] = [];
  const tileRegex = /\/(\d+)\/(\d+)\/(\d+)\.bin$/;

  // Use the highest zoom level from layerConfig where all points are visible without clustering
  const maxZoomLevel = layerConfig.layers;

  const filesToProcess: Array<{ file: File; zoom: number; x: number; y: number }> = [];

  for (const file of files) {
    const match = file.name.match(tileRegex);
    if (match) {
      const zoom = parseInt(match[1], 10);

      // Only process the highest zoom level where all points are visible without clustering
      if (zoom !== maxZoomLevel) {
        continue;
      }

      const x = parseInt(match[2], 10);
      const y = parseInt(match[3], 10);

      filesToProcess.push({ file, zoom, x, y });
    }
  }

  // Process files in batches to avoid overwhelming the system
  const BATCH_SIZE = 20;
  const batches = [];

  for (let i = 0; i < filesToProcess.length; i += BATCH_SIZE) {
    batches.push(filesToProcess.slice(i, i + BATCH_SIZE));
  }

  const allPointArrays: any[] = [];

  for (let i = 0; i < batches.length; i++) {
    const batch = batches[i];

    const batchResults = await processBatch(batch, polygon);
    allPointArrays.push(...batchResults);
  }

  allPointArrays.forEach((pointArray) => {
    pointsInPolygon.push(...pointArray);
  });

  const countByGeneName: Record<string, number> = {};
  for (const point of pointsInPolygon) {
    const geneName = point.geneName || 'unknown';
    countByGeneName[geneName] = (countByGeneName[geneName] || 0) + 1;
  }

  const totalTime = performance.now() - startTime;

  console.log(
    `✅ [ROI Detection] Found ${pointsInPolygon.length} points across ${Object.keys(countByGeneName).length} genes in ${totalTime.toFixed(0)}ms`
  );

  return {
    pointsInPolygon: pointsInPolygon,
    pointCount: pointsInPolygon.length,
    geneDistribution: countByGeneName
  };
};

const detectCellPolygonsInPolygon = async (polygon: PolygonFeature, cellMasksData: SingleMask[]) => {
  try {
    const startTime = performance.now();

    const cellPolygonsInDrawnPolygon: SingleMask[] = [];
    for (const cellMask of cellMasksData) {
      if (cellMask.vertices) {
        if (checkCellPolygonInDrawnPolygonWrapper(cellMask.vertices, polygon)) {
          cellPolygonsInDrawnPolygon.push(cellMask);
        }
      }
    }

    const countByClusterId: Record<string, number> = {};
    for (const cellPolygon of cellPolygonsInDrawnPolygon) {
      const clusterId = cellPolygon.clusterId || 'unknown';
      countByClusterId[clusterId] = (countByClusterId[clusterId] || 0) + 1;
    }

    const totalTime = performance.now() - startTime;

    console.log(
      `✅ [Cell Detection] Found ${cellPolygonsInDrawnPolygon.length} cells across ${Object.keys(countByClusterId).length} clusters in ${totalTime.toFixed(0)}ms`
    );

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

  try {
    if (type === 'detectPointsInPolygon') {
      const result = await detectPointsInPolygon(payload.polygon, payload.files, payload.layerConfig);

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
