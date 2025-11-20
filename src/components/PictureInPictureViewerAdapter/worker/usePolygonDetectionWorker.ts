import { useCallback, useRef } from 'react';
import type { PolygonWorkerMessage, PolygonWorkerResponse, PolygonPointData } from './polygonDetectionWorker.types';
import { SingleMask } from '../../../shared/types';
import { PolygonFeature } from '../../../stores/PolygonDrawingStore/PolygonDrawingStore.types';
import { LayerConfig } from '../../../stores/BinaryFilesStore/BinaryFilesStore.types';

export type PolygonDetectionWorkerHook = {
  detectPointsInPolygon: (
    polygon: PolygonFeature,
    files: File[],
    layerConfig: LayerConfig
  ) => Promise<{
    pointsInPolygon: PolygonPointData[];
    pointCount: number;
    geneDistribution: Record<string, number>;
    limitExceeded?: boolean;
    totalPointsFound?: number;
    suggestedReductionPercent?: number;
  }>;
  detectCellPolygonsInPolygon: (
    polygon: PolygonFeature,
    cellMasksData: SingleMask[]
  ) => Promise<{
    cellPolygonsInDrawnPolygon: SingleMask[];
    cellPolygonCount: number;
    cellClusterDistribution: Record<string, number>;
  }>;
  terminateWorker: () => void;
};

export const usePolygonDetectionWorker = (): PolygonDetectionWorkerHook => {
  const workerRef = useRef<Worker | null>(null);

  const getWorker = useCallback(() => {
    if (!workerRef.current) {
      workerRef.current = new Worker(new URL('./polygonDetectionWorker.ts', import.meta.url), { type: 'module' });
    }
    return workerRef.current;
  }, []);

  const detectPointsInPolygon = useCallback(
    (polygon: PolygonFeature, files: File[], layerConfig: LayerConfig) => {
      return new Promise<{
        pointsInPolygon: PolygonPointData[];
        pointCount: number;
        geneDistribution: Record<string, number>;
        limitExceeded?: boolean;
        totalPointsFound?: number;
        suggestedReductionPercent?: number;
      }>((resolve, reject) => {
        const worker = getWorker();

        const handleMessage = (e: MessageEvent<PolygonWorkerResponse>) => {
          const { type, payload } = e.data;

          if (type === 'pointsDetected') {
            worker.removeEventListener('message', handleMessage);
            if (payload.success) {
              resolve({
                pointsInPolygon: payload.pointsInPolygon,
                pointCount: payload.pointCount,
                geneDistribution: payload.geneDistribution,
                limitExceeded: payload.limitExceeded,
                totalPointsFound: payload.totalPointsFound,
                suggestedReductionPercent: payload.suggestedReductionPercent
              });
            }
          } else if (type === 'error') {
            worker.removeEventListener('message', handleMessage);
            reject(new Error(payload.error));
          }
        };

        worker.addEventListener('message', handleMessage);

        const message: PolygonWorkerMessage = {
          type: 'detectPointsInPolygon',
          payload: {
            polygon,
            files,
            layerConfig
          }
        };

        worker.postMessage(message);
      });
    },
    [getWorker]
  );

  const detectCellPolygonsInPolygon = useCallback(
    (polygon: PolygonFeature, cellMasksData: SingleMask[]) => {
      return new Promise<{
        cellPolygonsInDrawnPolygon: SingleMask[];
        cellPolygonCount: number;
        cellClusterDistribution: Record<string, number>;
      }>((resolve, reject) => {
        const worker = getWorker();

        const handleMessage = (e: MessageEvent<PolygonWorkerResponse>) => {
          const { type, payload } = e.data;

          if (type === 'cellPolygonsDetected') {
            worker.removeEventListener('message', handleMessage);
            if (payload.success) {
              resolve({
                cellPolygonsInDrawnPolygon: payload.cellPolygonsInDrawnPolygon,
                cellPolygonCount: payload.cellPolygonCount,
                cellClusterDistribution: payload.cellClusterDistribution
              });
            }
          } else if (type === 'error') {
            worker.removeEventListener('message', handleMessage);
            reject(new Error(payload.error));
          }
        };

        worker.addEventListener('message', handleMessage);

        const message: PolygonWorkerMessage = {
          type: 'detectCellPolygonsInPolygon',
          payload: {
            polygon,
            cellMasksData
          }
        };

        worker.postMessage(message);
      });
    },
    [getWorker]
  );

  const terminateWorker = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }
  }, []);

  return {
    detectPointsInPolygon,
    detectCellPolygonsInPolygon,
    terminateWorker
  };
};
