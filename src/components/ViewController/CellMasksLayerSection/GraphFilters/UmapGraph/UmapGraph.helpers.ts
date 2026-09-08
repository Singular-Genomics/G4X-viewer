import { SingleMask } from '../../../../../shared/types';
import type { CellSegmentationColormapEntry } from '../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore.types';
import { UmapClusterPoint } from './UmapGraph.types';

export async function getPlotData(
  cellMasksData: SingleMask[],
  colorMapConfig: CellSegmentationColormapEntry[],
  subsamplingValue: number = 1
): Promise<UmapClusterPoint[]> {
  return new Promise((resolve, reject) => {
    const umapData = new Map<string, UmapClusterPoint>();

    if (subsamplingValue <= 0) {
      reject([
        {
          x: [],
          y: [],
          clusterId: ''
        }
      ]);
    }

    for (let i = 0; i < cellMasksData.length; i += subsamplingValue) {
      const mask = cellMasksData[i];
      const {
        clusterId,
        umapValues: { umapX, umapY }
      } = mask;
      const entry = umapData.get(clusterId) ?? { x: [], y: [], clusterId };

      entry.x.push(umapX);
      entry.y.push(umapY);
      umapData.set(clusterId, entry);
    }

    // Match the CellsFilterTable's order, independent of subsampling
    const clusterOrder = new Map(colorMapConfig.map((entry, index) => [entry.clusterId, index]));
    const result = [...umapData.values()].sort((a, b) => {
      const orderA = clusterOrder.get(a.clusterId);
      const orderB = clusterOrder.get(b.clusterId);

      if (orderA !== undefined && orderB !== undefined) return orderA - orderB;
      if (orderA !== undefined) return -1;
      if (orderB !== undefined) return 1;

      return a.clusterId.localeCompare(b.clusterId);
    });
    resolve(result);
  });
}

export function buildColorLookup(colorMap: CellSegmentationColormapEntry[]) {
  return Object.fromEntries(colorMap.map((entry) => [entry.clusterId, `rgb(${entry.color.join(',')})`]));
}
