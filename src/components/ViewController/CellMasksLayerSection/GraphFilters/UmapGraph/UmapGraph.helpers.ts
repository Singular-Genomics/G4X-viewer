import { SingleMask } from '../../../../../shared/types';
import { UmapClusterPoint } from './UmapGraph.types';

export async function getPlotData(
  cellMasksData: SingleMask[],
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

    const result = [...umapData.values()].sort(sortUmapData);
    resolve(result);
  });
}

// sort UmapData base on clusterId to match the order in the CellsFilterTable
function sortUmapData(a: UmapClusterPoint, b: UmapClusterPoint) {
  const idA = Number(a.clusterId);
  const idB = Number(b.clusterId);

  const isNegA = idA < 0;
  const isNegB = idB < 0;

  // Both negative → normal ascending
  if (isNegA && isNegB) return idA - idB;

  // One negative → push it to the end
  if (isNegA && !isNegB) return 1;
  if (!isNegA && isNegB) return -1;

  // Both non-negative → normal ascending
  return idA - idB;
}
