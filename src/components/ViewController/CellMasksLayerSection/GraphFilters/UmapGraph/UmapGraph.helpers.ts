import { Datum } from 'plotly.js';
import { SingleMask } from '../../../../../shared/types';

export async function getPlotData(
  cellMasksData: SingleMask[],
  subsamplingValue: number = 1
): Promise<{ x: Datum[]; y: Datum[] }> {
  return new Promise((resolve, reject) => {
    const xAxisValues = [];
    const yAxisValues = [];

    if (subsamplingValue <= 0) {
      reject({
        x: [],
        y: []
      });
    }

    for (let i = 0; i < cellMasksData.length; i += subsamplingValue) {
      const mask = cellMasksData[i];
      xAxisValues.push(mask.umapValues.umapX);
      yAxisValues.push(mask.umapValues.umapY);
    }

    resolve({
      x: xAxisValues,
      y: yAxisValues
    });
  });
}
