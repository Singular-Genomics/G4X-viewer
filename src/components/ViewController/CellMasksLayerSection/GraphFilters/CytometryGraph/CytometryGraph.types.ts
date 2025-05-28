import { AxisTypes, GraphMode } from '../../../../../stores/CytometryGraphStore/CytometryGraphStore.types';
import { CytometryWorkerOutput } from './helpers/cytometryWorker';

export type CytometryDataPoint = {
  value_X: number;
  value_Y: number;
  count: number;
};

export type GraphData = {
  axisType: AxisTypes;
  graphMode: GraphMode;
} & Pick<CytometryWorkerOutput, 'data' | 'metadata'>;

export type LoaderInfo = {
  progress?: number;
  message?: string;
};
