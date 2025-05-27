import { HeatmapWorkerInput } from './heatmapWorker';

const MAX_DATA_SET_SIZE = 1_000_000;

const findMinValue = (array: number[]): number => {
  return array.reduce((min, curr) => (curr < min ? curr : min), Infinity);
};

const findMaxValue = (array: number[]): number => {
  return array.reduce((max, curr) => (curr > max ? curr : max), -Infinity);
};

function findBinIndex(value: number, bins: number[]) {
  if (value < bins[0] || value >= bins[bins.length - 1]) {
    return -1;
  }

  let low = 0;
  let high = bins.length - 2;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    if (value >= bins[mid] && value < bins[mid + 1]) {
      return mid;
    } else if (value < bins[mid]) {
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return -1;
}

function findBin2D(x: number, y: number, xBins: number[], yBins: number[]) {
  const xBinIndex = findBinIndex(x, xBins);
  const yBinIndex = findBinIndex(y, yBins);

  if (xBinIndex === -1 || yBinIndex === -1) {
    return null; // Point is outside the valid bin range
  }

  return { x: xBinIndex, y: yBinIndex };
}

onmessage = async function (e: MessageEvent<HeatmapWorkerInput>) {
  const { xValues, yValues, binXCount, binYCount, axisType } = e.data;

  const subSamplingValue = Math.ceil(Math.max(xValues.length / MAX_DATA_SET_SIZE, yValues.length / MAX_DATA_SET_SIZE));

  const xValuesSampled = xValues.filter((_, idx) => !(idx % subSamplingValue));
  const yValuesSampled = yValues.filter((_, idx) => !(idx % subSamplingValue));

  const xMax = findMaxValue(xValuesSampled);
  const xMin = findMinValue(xValuesSampled);
  const yMax = findMaxValue(yValuesSampled);
  const yMin = findMinValue(yValuesSampled);

  if (axisType === 'linear') {
    this.postMessage({
      progress: 0,
      completed: false,
      message: 'Processing bins for a linear axis'
    });

    const yBinSize = (yMax - yMin) / binYCount;
    const xBinSize = (xMax - xMin) / binXCount;

    const zMatrix = Array(binYCount + 1)
      .fill(0)
      .map(() => Array(binXCount + 1).fill(0));
    const xAxis = Array(binXCount + 1)
      .fill(0)
      .map((_, i) => xMin + i * xBinSize);
    const yAxis = Array(binYCount + 1)
      .fill(0)
      .map((_, i) => yMin + i * yBinSize);

    this.postMessage({
      progress: 10,
      completed: false,
      message: 'Bining data points...'
    });
    const totalPoints = xValuesSampled.length;
    for (let i = 0; i < totalPoints; i++) {
      if (i % 1000 === 0) {
        const progressPercentage = 20 + Math.floor((i / totalPoints) * 90);
        this.postMessage({
          progress: progressPercentage,
          completed: false,
          message: `Processing data points: ${i}/${totalPoints}`
        });
      }

      const x = xValuesSampled[i];
      const y = yValuesSampled[i];

      const xBin = Math.floor((x - xMin) / xBinSize);
      const yBin = Math.floor((y - yMin) / yBinSize);

      zMatrix[yBin][xBin] += 1;
    }

    const heatmapData = {
      z: zMatrix,
      y: yAxis,
      x: xAxis
    };

    const heatmapMetadata = {
      xMax,
      xMin,
      yMax,
      yMin,
      subsampling: subSamplingValue
    };

    this.postMessage({
      progress: 100,
      completed: true,
      message: 'Aggregation complete',
      data: heatmapData,
      metadata: heatmapMetadata
    });
  } else {
    this.postMessage({
      progress: 0,
      completed: false,
      message: 'Processing bins for a logarithmic axis'
    });

    const logMaxX = xMax ? Math.ceil(Math.log10(xMax)) : 0;
    const logMinX = xMin ? Math.floor(Math.log10(xMin)) : 0;
    const logMaxY = yMax ? Math.ceil(Math.log10(yMax)) : 0;
    const logMinY = yMin ? Math.floor(Math.log10(yMin)) : 0;

    const logStepX = (logMaxX - logMinX) / binXCount;
    const logStepY = (logMaxY - logMinY) / binYCount;

    const zMatrix = Array(binYCount)
      .fill(0)
      .map(() => Array(binXCount).fill(0));
    const xAxis = Array(binXCount)
      .fill(0)
      .map((_, i) => Math.pow(10, logMinX + i * logStepX));
    const yAxis = Array(binYCount)
      .fill(0)
      .map((_, i) => Math.pow(10, logMinY + i * logStepY));

    this.postMessage({
      progress: 10,
      completed: false,
      message: 'Bining data points...'
    });
    const failed = [];
    const totalPoints = xValuesSampled.length;
    for (let i = 0; i < totalPoints; i++) {
      if (i % 1000 === 0) {
        const progressPercentage = 20 + Math.floor((i / totalPoints) * 90);
        this.postMessage({
          progress: progressPercentage,
          completed: false,
          message: `Processing data points: ${i}/${totalPoints}`
        });
      }

      const x = xValuesSampled[i];
      const y = yValuesSampled[i];

      const index = findBin2D(x, y, xAxis, yAxis);

      if (!index) continue;

      try {
        zMatrix[index.x][index.y] += 1;
      } catch {
        failed.push(index);
        continue;
      }
    }

    const heatmapData = {
      z: zMatrix,
      y: yAxis,
      x: xAxis
    };

    console.table(failed);

    const heatmapMetadata = {
      xMax,
      xMin,
      yMax,
      yMin,
      subsampling: subSamplingValue
    };

    this.postMessage({
      progress: 100,
      completed: true,
      message: 'Aggregation complete',
      data: heatmapData,
      metadata: heatmapMetadata
    });
  }
};
