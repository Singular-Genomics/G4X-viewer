import { SingleMask } from '../../../shared/types';
import { PolygonFeature } from '../../../stores/PolygonDrawingStore/PolygonDrawingStore.types';
import { LayerConfig } from '../../../stores/ZarrDataStore/ZarrDataStore.types';

export type PolygonPointData = {
  position: number[];
  color?: number[];
  geneName: string;
  cellId: string;
};

export type TileCoordinates = {
  x: number;
  y: number;
};

export type PointsDetectionBatchResult = {
  allPointArrays: PolygonPointData[][];
  totalPointsFound: number;
  limitExceeded: boolean;
};

export type PolygonWorkerMessage =
  | {
      type: 'detectPointsInPolygon';
      payload: {
        polygon: PolygonFeature;
        layerConfig: LayerConfig;
        zarrUrl?: string;
      };
    }
  | {
      type: 'detectCellPolygonsInPolygon';
      payload: {
        polygon: PolygonFeature;
        cellMasksData: SingleMask[];
      };
    };

export type PolygonWorkerResponse =
  | {
      type: 'pointsDetected';
      payload: {
        success: true;
        pointsInPolygon: PolygonPointData[];
        pointCount: number;
        geneDistribution: Record<string, number>;
        limitExceeded?: boolean;
        totalPointsFound?: number;
        suggestedReductionPercent?: number;
      };
    }
  | {
      type: 'cellPolygonsDetected';
      payload: {
        success: true;
        cellPolygonsInDrawnPolygon: SingleMask[];
        cellPolygonCount: number;
        cellClusterDistribution: Record<string, number>;
      };
    }
  | {
      type: 'error';
      payload: {
        success: false;
        error: string;
      };
    };
