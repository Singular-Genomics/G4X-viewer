import { SingleMask } from '../../../shared/types';

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
        polygon: any;
        files: any[];
      };
    }
  | {
      type: 'detectCellPolygonsInPolygon';
      payload: {
        polygon: any;
        cellMasksData: SingleMask[];
      };
    };

export type PolygonWorkerResponse =
  | {
      type: 'pointsDetected';
      payload: {
        success: true;
        pointsInPolygon: any[];
        pointCount: number;
        geneDistribution: Record<string, number>;
      };
    }
  | {
      type: 'cellPolygonsDetected';
      payload: {
        success: true;
        cellPolygonsInDrawnPolygon: any[];
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
