import { HeatmapWorkerInput } from './heatmapWorker';

const MAX_DATA_SET_SIZE = 1_000_000;

const findMinValue = (array: number[]): number => {
  return array.reduce((min, curr) => (curr < min ? curr : min), Infinity);
};

const findMaxValue = (array: number[]): number => {
  return array.reduce((max, curr) => (curr > max ? curr : max), -Infinity);
};

onmessage = async function (e: MessageEvent<HeatmapWorkerInput>) {
  const { xValues, yValues, binSize } = e.data;

  const subSamplingValue = Math.ceil(Math.max(xValues.length / MAX_DATA_SET_SIZE, yValues.length / MAX_DATA_SET_SIZE));
  this.postMessage({ progress: 0, completed: false, message: `Subsampling value: ${subSamplingValue}` });

  const xValuesSampled = xValues.filter((_, idx) => !(idx % subSamplingValue));
  const yValuesSampled = yValues.filter((_, idx) => !(idx % subSamplingValue));

  const xMax = findMaxValue(xValuesSampled);
  const xMin = findMinValue(xValuesSampled);
  const yMax = findMaxValue(yValuesSampled);
  const yMin = findMinValue(yValuesSampled);

  const xBins = Math.ceil((xMax - xMin) / binSize) + 1;
  const yBins = Math.ceil((yMax - yMin) / binSize) + 1;

  this.postMessage({ progress: 10, completed: false, message: 'Initializing bins' });
  const zMatrix: number[][] = Array(yBins)
    .fill(0)
    .map(() => Array(xBins).fill(0));

  const xAxis = Array(xBins)
    .fill(0)
    .map((_, i) => xMin + i * binSize);
  const yAxis = Array(yBins)
    .fill(0)
    .map((_, i) => yMin + i * binSize);

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

    const xBin = Math.floor((x - xMin) / binSize);
    const yBin = Math.floor((y - yMin) / binSize);

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
};
