import {
  CytometryWorkerHeatmapData,
  CytometryWorkerInput,
  CytometryWorkerScatterData,
  CytometryWorkerStatus
} from './cytometryWorker';

const findMinMaxValue = (array: number[], includeZero = true): [number, number] => {
  if (includeZero) {
    return array.reduce(
      (out, curr) => [curr < out[0] ? curr : out[0], curr > out[1] ? curr : out[1]],
      [Infinity, -Infinity]
    );
  }

  return array.reduce(
    (out, curr) => [curr !== 0 && curr < out[0] ? curr : out[0], curr > out[1] ? curr : out[1]],
    [Infinity, -Infinity]
  );
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
    return null;
  }

  return { x: xBinIndex, y: yBinIndex };
}

function processLinearBinning(
  xValuesSampled: number[],
  yValuesSampled: number[],
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  binXCount: number,
  binYCount: number,
  graphMode: string,
  postMessage: (data: any) => void
) {
  const yBinSize = (yMax - yMin) / binYCount;
  const xBinSize = (xMax - xMin) / binXCount;

  const zMatrix = Array(binYCount + 1)
    .fill(0)
    .map(() => Array(binXCount + 1).fill(0));
  const pointBinMap = new Map();

  postMessage({
    progress: 10,
    completed: false,
    status: CytometryWorkerStatus.BINING
  });
  const totalPoints = xValuesSampled.length;
  for (let i = 0; i < totalPoints; i++) {
    if (i % 1000 === 0) {
      const progressPercentage = 20 + Math.floor((i / totalPoints) * 90);
      postMessage({
        progress: progressPercentage,
        completed: false,
        status: CytometryWorkerStatus.PROCESSING
      });
    }

    const x = xValuesSampled[i];
    const y = yValuesSampled[i];

    const xBin = Math.floor((x - xMin) / xBinSize);
    const yBin = Math.floor((y - yMin) / yBinSize);

    zMatrix[yBin][xBin] += 1;
    pointBinMap.set(i, { x: xBin, y: yBin });
  }

  const [zMin, zMax] = findMinMaxValue(zMatrix.flat());

  const heatmapMetadata = { xMax, xMin, yMax, yMin, zMax, zMin };

  if (graphMode === 'heatmap') {
    const xAxis = Array(binXCount + 1)
      .fill(0)
      .map((_, i) => xMin + i * xBinSize);
    const yAxis = Array(binYCount + 1)
      .fill(0)
      .map((_, i) => yMin + i * yBinSize);

    const heatmapData: CytometryWorkerHeatmapData = {
      z: zMatrix,
      y: yAxis,
      x: xAxis
    };

    postMessage({
      progress: 100,
      completed: true,
      success: true,
      status: CytometryWorkerStatus.COMPLETE,
      data: heatmapData,
      metadata: heatmapMetadata
    });
  } else {
    const heatmapData: CytometryWorkerScatterData = {
      z: [],
      y: [],
      x: []
    };

    for (let i = 0; i < totalPoints; i++) {
      if (i % 1000 === 0) {
        const progressPercentage = 60 + Math.floor((i / totalPoints) * 30);
        postMessage({
          progress: progressPercentage,
          completed: false,
          status: CytometryWorkerStatus.NORMALIZING
        });
      }

      const binIndex = pointBinMap.get(i);
      if (!binIndex) continue;

      const currentCount = zMatrix[binIndex.y][binIndex.x];
      if (currentCount === 0) continue;

      heatmapData.x.push(xValuesSampled[i]);
      heatmapData.y.push(yValuesSampled[i]);
      heatmapData.z.push(currentCount / zMax);
    }

    postMessage({
      progress: 100,
      completed: true,
      success: true,
      status: CytometryWorkerStatus.COMPLETE,
      data: heatmapData,
      metadata: heatmapMetadata
    });
  }
}

function processLogarithmicBinning(
  cellIdsSampled: string[],
  xValuesSampled: number[],
  yValuesSampled: number[],
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  binXCount: number,
  binYCount: number,
  graphMode: string,
  postMessage: (data: any) => void
) {
  const adjustedXMin = xMin;
  const adjustedYMin = yMin;

  const logMinX = Math.log10(adjustedXMin);
  const logMaxX = Math.log10(xMax);
  const logMinY = Math.log10(adjustedYMin);
  const logMaxY = Math.log10(yMax);

  const logStepX = (logMaxX - logMinX + 1) / binXCount;
  const logStepY = (logMaxY - logMinY + 1) / binYCount;

  const zMatrix = Array(binYCount)
    .fill(0)
    .map(() => Array(binXCount).fill(0));
  const xAxis = Array(binXCount)
    .fill(0)
    .map((_, i) => Math.pow(10, logMinX + i * logStepX));
  const yAxis = Array(binYCount)
    .fill(0)
    .map((_, i) => Math.pow(10, logMinY + i * logStepY));
  const pointBinMap = new Map();

  postMessage({
    progress: 10,
    completed: false,
    status: CytometryWorkerStatus.BINING
  });

  const failed = [];
  const totalPoints = xValuesSampled.length;
  for (let i = 0; i < totalPoints; i++) {
    if (i % 1000 === 0) {
      const progressPercentage = 20 + Math.floor((i / totalPoints) * 40);
      postMessage({
        progress: progressPercentage,
        completed: false,
        status: CytometryWorkerStatus.PROCESSING
      });
    }

    const x = xValuesSampled[i];
    const y = yValuesSampled[i];

    const index = findBin2D(x, y, xAxis, yAxis);

    if (!index) {
      failed.push(cellIdsSampled[i]);
      continue;
    }

    try {
      zMatrix[index.y][index.x] += 1;
      pointBinMap.set(i, index);
    } catch {
      failed.push(cellIdsSampled[i]);
      continue;
    }
  }

  const [zMin, zMax] = findMinMaxValue(zMatrix.flat());

  const heatmapMetadata = {
    xMax,
    xMin,
    yMax,
    yMin,
    zMax,
    zMin,
    failed
  };

  if (graphMode === 'heatmap') {
    const heatmapData: CytometryWorkerHeatmapData = {
      z: zMatrix,
      y: yAxis,
      x: xAxis
    };

    postMessage({
      progress: 100,
      completed: true,
      success: true,
      status: CytometryWorkerStatus.COMPLETE,
      data: heatmapData,
      metadata: heatmapMetadata
    });
  } else {
    const heatmapData: CytometryWorkerScatterData = {
      z: [],
      y: [],
      x: []
    };

    for (let i = 0; i < totalPoints; i++) {
      if (i % 1000 === 0) {
        const progressPercentage = 60 + Math.floor((i / totalPoints) * 30);
        postMessage({
          progress: progressPercentage,
          completed: false,
          status: CytometryWorkerStatus.NORMALIZING
        });
      }

      const binIndex = pointBinMap.get(i);
      if (!binIndex) continue;

      const currentCount = zMatrix[binIndex.y][binIndex.x];
      if (currentCount === 0) continue;

      heatmapData.x.push(xValuesSampled[i]);
      heatmapData.y.push(yValuesSampled[i]);
      heatmapData.z.push(currentCount / zMax);
    }

    postMessage({
      progress: 100,
      completed: true,
      success: true,
      status: CytometryWorkerStatus.COMPLETE,
      data: heatmapData,
      metadata: heatmapMetadata
    });
  }
}

onmessage = async function (e: MessageEvent<CytometryWorkerInput>) {
  const { maskData, xProteinName, yProteinName, binXCount, binYCount, axisType, subsamplingStep, graphMode } = e.data;

  if (!maskData.length) {
    this.postMessage({
      completed: true,
      success: false,
      status: CytometryWorkerStatus.NO_MASK
    });
  } else if (!xProteinName || !yProteinName) {
    this.postMessage({
      completed: true,
      success: false,
      status: CytometryWorkerStatus.NO_PROTEIN
    });
  } else if (subsamplingStep <= 0) {
    this.postMessage({
      completed: true,
      success: false,
      status: CytometryWorkerStatus.INVALID
    });
  }

  const sampledLength = Math.ceil(maskData.length / subsamplingStep);
  const xValuesSampled = new Array(sampledLength);
  const yValuesSampled = new Array(sampledLength);
  const idsSampled = new Array(sampledLength);

  let sampleIndex = 0;
  for (let i = 0; i < maskData.length; i += subsamplingStep) {
    xValuesSampled[sampleIndex] = maskData[i].proteins[xProteinName] + 1;
    yValuesSampled[sampleIndex] = maskData[i].proteins[yProteinName] + 1;
    idsSampled[sampleIndex] = maskData[i].cellId;
    sampleIndex++;
  }

  const [xMin, xMax] = findMinMaxValue(xValuesSampled, false);
  const [yMin, yMax] = findMinMaxValue(yValuesSampled, false);

  if (axisType === 'linear') {
    this.postMessage({
      progress: 0,
      completed: false,
      status: CytometryWorkerStatus.MODE_LINEAR
    });

    processLinearBinning(
      xValuesSampled,
      yValuesSampled,
      xMin,
      xMax,
      yMin,
      yMax,
      binXCount,
      binYCount,
      graphMode,
      (data) => this.postMessage(data)
    );
  } else {
    this.postMessage({
      progress: 0,
      completed: false,
      status: CytometryWorkerStatus.MODE_LOG
    });

    processLogarithmicBinning(
      idsSampled,
      xValuesSampled,
      yValuesSampled,
      xMin,
      xMax,
      yMin,
      yMax,
      binXCount,
      binYCount,
      graphMode,
      (data) => this.postMessage(data)
    );
  }
};
