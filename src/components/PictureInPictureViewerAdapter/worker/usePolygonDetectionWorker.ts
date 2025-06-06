import { useCallback, useRef } from 'react';
import type { PolygonWorkerMessage, PolygonWorkerResponse } from './polygonDetectionWorker.types';

export type PolygonDetectionWorkerHook = {
  detectPointsInPolygon: (
    polygon: any,
    files: any[]
  ) => Promise<{
    pointsInPolygon: any[];
    pointCount: number;
    geneDistribution: Record<string, number>;
  }>;
  detectCellPolygonsInPolygon: (
    polygon: any,
    cellMasksData: Uint8Array
  ) => Promise<{
    cellPolygonsInDrawnPolygon: any[];
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
    (polygon: any, files: any[]) => {
      return new Promise<{
        pointsInPolygon: any[];
        pointCount: number;
        geneDistribution: Record<string, number>;
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
                geneDistribution: payload.geneDistribution
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
            files
          }
        };

        worker.postMessage(message);
      });
    },
    [getWorker]
  );

  const detectCellPolygonsInPolygon = useCallback(
    (polygon: any, cellMasksData: Uint8Array) => {
      return new Promise<{
        cellPolygonsInDrawnPolygon: any[];
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
