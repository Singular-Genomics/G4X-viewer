import { Datum } from 'plotly.js';
import WorkerScript from './script.ts?worker';
import { AxisTypes } from '../../../../../../stores/CytometryGraphStore/CytometryGraphStore.types';
import { SingleMask } from '../../../../../../shared/types';

export type HeatmapWorkerInput = {
  maskData: SingleMask[];
  xProteinName: string;
  yProteinName: string;
  binXCount: number;
  binYCount: number;
  axisType: AxisTypes;
  subsamplingStep: number;
};

export type HeatmapWorkerOutput = {
  progress?: number;
  completed?: boolean;
  success?: boolean;
  message?: string;
  data?: {
    x: Datum[];
    y: Datum[];
    z: number[];
  };
  metadata?: {
    xMax?: number;
    xMin?: number;
    yMax?: number;
    yMin?: number;
  };
};

export class HeatmapWorker {
  private name = 'Heatmap Worker';
  private worker: Worker;

  constructor() {
    this.worker = new WorkerScript();
  }

  public postMessage(input: HeatmapWorkerInput): void {
    this.worker.postMessage(input);
  }

  public onMessage(callback: (data: HeatmapWorkerOutput) => void): void {
    this.worker.onmessage = (e) => callback(e.data as HeatmapWorkerOutput);
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
