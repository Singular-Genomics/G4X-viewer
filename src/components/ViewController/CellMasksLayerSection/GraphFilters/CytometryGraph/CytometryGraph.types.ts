import { Datum } from 'plotly.js';
import { AxisTypes } from '../../../../../stores/CytometryGraphStore/CytometryGraphStore.types';
import { HeatmapWorkerMetadata } from './helpers/heatmapWorker';

export type CytometryDataPoint = {
  value_X: number;
  value_Y: number;
  count: number;
};

export type GraphData = {
  x: Datum[];
  y: Datum[];
  z: number[];
  axisType: AxisTypes;
  metadata?: HeatmapWorkerMetadata;
};

export type LoaderInfo = {
  progress?: number;
  message?: string;
};
