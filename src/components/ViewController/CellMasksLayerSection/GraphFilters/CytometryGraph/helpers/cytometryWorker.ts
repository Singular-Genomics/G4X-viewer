import { Datum } from 'plotly.js';
import WorkerScript from './script.ts?worker';
import { AxisTypes, GraphMode } from '../../../../../../stores/CytometryGraphStore/CytometryGraphStore.types';
import { SingleMask } from '../../../../../../shared/types';

export type CytometryWorkerInput = {
  maskData: SingleMask[];
  xProteinName: string;
  yProteinName: string;
  binXCount: number;
  binYCount: number;
  axisType: AxisTypes;
  subsamplingStep: number;
  graphMode: GraphMode;
};

export type CytometryWorkerOutput = {
  progress?: number;
  completed?: boolean;
  success?: boolean;
  status?: string;
  data?: CytometryWorkerHeatmapData | CytometryWorkerScatterData;
  metadata?: CytometryWorkerMetadata;
};

export enum CytometryWorkerStatus {
  BINING = 'biningData',
  PROCESSING = 'processingData',
  COMPLETE = 'complete',
  NORMALIZING = 'normalizing',
  NO_MASK = 'missingMask',
  NO_PROTEIN = 'missingProtein',
  INVALID = 'invalidValue',
  MODE_LINEAR = 'modeLinear',
  MODE_LOG = 'modeLog'
}

export type CytometryWorkerScatterData = {
  x: Datum[];
  y: Datum[];
  z: number[];
};

export type CytometryWorkerHeatmapData = {
  x: Datum[];
  y: Datum[];
  z: Datum[][];
};

export type CytometryWorkerMetadata = {
  xMax?: number;
  xMin?: number;
  yMax?: number;
  yMin?: number;
  zMin?: number;
  zMax?: number;
  failed?: string[];
};

export class CytometryWorker {
  private name = 'Heatmap Worker';
  private worker: Worker;

  constructor() {
    this.worker = new WorkerScript();
  }

  public postMessage(input: CytometryWorkerInput): void {
    this.worker.postMessage(input);
  }

  public onMessage(callback: (data: CytometryWorkerOutput) => void): void {
    this.worker.onmessage = (e) => callback(e.data as CytometryWorkerOutput);
  }

  public onError(callback: (error: ErrorEvent) => void): void {
    this.worker.onerror = (e) => callback(e);
  }

  public terminateWorker(): void {
    this.worker.terminate();
  }

  public getName(): string {
    return this.name;
  }
}
