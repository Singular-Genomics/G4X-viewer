import { Datum } from 'plotly.js';
import WorkerScript from './script.ts?worker';

export type HeatmapWorkerInput = {
  xValues: number[];
  yValues: number[];
  binSize: number;
};

export type HeatmapWorkerOutput = {
  progress?: number;
  completed?: boolean;
  message?: boolean;
  data?: {
    x: Datum[];
    y: Datum[];
    z: Datum[][];
  };
  metadata?: {
    xMax?: number;
    xMin?: number;
    yMax?: number;
    yMin?: number;
    subsampling?: number;
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
