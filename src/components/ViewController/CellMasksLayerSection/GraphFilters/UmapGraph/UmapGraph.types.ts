import type { Datum } from 'plotly.js';

export type UmapClusterPoint = {
  x: Datum[];
  y: Datum[];
  clusterId: string;
};
