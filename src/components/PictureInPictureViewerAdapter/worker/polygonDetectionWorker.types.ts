import { SingleMask } from '../../../shared/types';
import { PolygonFeature } from '../../../stores/PolygonDrawingStore/PolygonDrawingStore.types';

export type PolygonPointData = {
  position: number[];
  color: number[];
  geneName: string;
  cellId: string;
};

export type PolygonTileData = {
  pointsData: PolygonPointData[];
  numberOfPoints: number;
};

export type PolygonWorkerMessage =
  | {
      type: 'detectPointsInPolygon';
      payload: {
        polygon: PolygonFeature;
        files: File[];
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
