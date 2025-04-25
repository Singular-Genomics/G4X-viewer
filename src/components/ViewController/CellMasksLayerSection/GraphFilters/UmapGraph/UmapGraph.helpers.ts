import { Datum } from 'plotly.js';
import { SingleMask } from '../../../../../shared/types';

export async function getPlotData(
  cellMasksData: SingleMask[],
  subsamplingValue: number
): Promise<{ x: Datum[]; y: Datum[] }> {
  return new Promise((resolve) => {
    let xAxisValues = cellMasksData.map((mask) => mask.umapValues.umapX);
    let yAxisValues = cellMasksData.map((mask) => mask.umapValues.umapY);

    if (subsamplingValue) {
      xAxisValues = xAxisValues.filter((_, idx) => !(idx % subsamplingValue));
      yAxisValues = yAxisValues.filter((_, idx) => !(idx % subsamplingValue));
    }

    resolve({
      x: xAxisValues,
      y: yAxisValues
    });
  });
}
