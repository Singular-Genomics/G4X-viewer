import { useCallback } from 'react';
import { useCellSegmentationLayerStore } from '../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { HeatmapChartDataEntry, ParseCellsByRoiParams } from './HeatmapChartPlot.types';
import { useTranslation } from 'react-i18next';
import { SingleMask } from '../../../../../shared/types';
import { thresholdColorMap } from '../../../../../shared/components/GxColorscaleSlider';

const normalizeMinMax = (values: number[]): number[] => {
  if (values.length === 0) return values;

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue;

  if (range === 0) return values;

  return values.map((v) => (v - minValue) / range);
};

const normalizeZScore = (values: number[]): number[] => {
  if (values.length === 0) return values;

  const mean = values.reduce((sum, curr) => sum + curr, 0) / values.length;
  const standardDeviation = Math.sqrt(values.reduce((sum, curr) => sum + Math.pow(curr - mean, 2), 0) / values.length);

  if (standardDeviation === 0) return values;

  return values.map((v) => (v - mean) / standardDeviation);
};

const applyNormalization = (
  zMatrix: number[][],
  method: 'min-max' | 'z-score',
  axis: 'x' | 'y' | 'both'
): number[][] => {
  if (!zMatrix.length) return zMatrix;

  const normalizeFunc = method === 'min-max' ? normalizeMinMax : normalizeZScore;
  const result = zMatrix.map((row) => [...row]);

  if (axis === 'both') {
    const flatValues = result.flat();
    const normalized = normalizeFunc(flatValues);
    let idx = 0;
    for (let i = 0; i < result.length; i++) {
      for (let j = 0; j < result[i].length; j++) {
        result[i][j] = normalized[idx++];
      }
    }
  } else if (axis === 'y') {
    // Y-axis: normalize within each ROI/cluster (column)
    const numCols = result[0]?.length || 0;
    for (let j = 0; j < numCols; j++) {
      const columnValues = result.map((row) => row[j]);
      const normalized = normalizeFunc(columnValues);
      for (let i = 0; i < result.length; i++) {
        result[i][j] = normalized[i];
      }
    }
  } else if (axis === 'x') {
    // X-axis: normalize within each gene/protein (row)
    for (let i = 0; i < result.length; i++) {
      result[i] = normalizeFunc(result[i]);
    }
  }

  return result;
};

export function useHeatmapChartPlotDataParser() {
  const { t } = useTranslation();
  const { selectedCells, segmentationMetadata } = useCellSegmentationLayerStore();

  const getGeneValue = (cell: SingleMask, selectedValueIndex: number): number | null => {
    const idx = cell.nonzeroGeneIndices.findIndex((index: number) => index === selectedValueIndex);
    return idx === -1 ? null : cell.nonzeroGeneValues[idx];
  };

  const getProteinValue = (cell: SingleMask, selectedValueIndex: number): number =>
    cell.proteinValues[selectedValueIndex];

  const parseCellsByRoi = useCallback(
    ({
      rois,
      valueType,
      selectedValues,
      settings,
      upperThreshold,
      lowerThreshold
    }: ParseCellsByRoiParams): HeatmapChartDataEntry[] => {
      if (!selectedCells.length || !segmentationMetadata || !selectedValues.length) {
        return [];
      }

      const valueNames = valueType === 'gene' ? segmentationMetadata.geneNames : segmentationMetadata.proteinNames;

      // Map selected value names to their indices
      const selectedValueIndices = selectedValues
        .map((name) => valueNames.findIndex((vName) => vName === name))
        .filter((idx) => idx !== -1);

      if (!selectedValueIndices.length) {
        return [];
      }

      const orderedRois = settings.sortRois ? [...rois].sort((a, b) => a - b) : rois;
      const cellsByRoiId = new Map(selectedCells.map((sel) => [sel.roiId, sel]));
      const validSelection = orderedRois.length
        ? orderedRois.map((roiId) => cellsByRoiId.get(roiId)).filter((sel) => sel !== undefined)
        : [];

      if (!validSelection.length) {
        return [];
      }

      const getCellValue = valueType === 'gene' ? getGeneValue : getProteinValue;
      const multipleROIs = rois.length > 1;

      // Multiple ROIs: X = ROI, Y = proteins/genes
      if (multipleROIs) {
        const dataMatrix: { [valueName: string]: { [roiId: string]: number[] } } = {};
        const roiIds = new Set<string>();
        const valueNamesSet = new Set<string>();

        for (const selection of validSelection) {
          if (!selection.data?.length) continue;

          const roiId = selection.roiId.toString();
          roiIds.add(roiId);

          for (const cell of selection.data) {
            for (let i = 0; i < selectedValueIndices.length; i++) {
              const valueIndex = selectedValueIndices[i];
              const valueName = selectedValues[i];
              const value = getCellValue(cell, valueIndex);

              valueNamesSet.add(valueName);

              if (!dataMatrix[valueName]) {
                dataMatrix[valueName] = {};
              }

              if (!dataMatrix[valueName][roiId]) {
                dataMatrix[valueName][roiId] = [];
              }

              dataMatrix[valueName][roiId].push(value ?? 0);
            }
          }
        }

        // Build heatmap matrix: rows = proteins/genes, cols = ROIs
        const orderedRoiIds = orderedRois.map(String).filter((id) => roiIds.has(id));
        const sortedValueNames = Array.from(valueNamesSet);

        let zMatrix: number[][] = [];
        const xLabels = orderedRoiIds.map((id) => t('general.roiEntry', { index: id }));
        const yLabels = sortedValueNames;

        for (const valueName of sortedValueNames) {
          const row: number[] = [];
          for (const roiId of orderedRoiIds) {
            const values = dataMatrix[valueName]?.[roiId] || [];
            const meanValue = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
            row.push(meanValue);
          }
          zMatrix.push(row);
        }

        let colorscale: string | [number, string][] = settings.colorscale?.value || 'Viridis';

        if (settings.colorscale?.reversed && Array.isArray(colorscale)) {
          colorscale = colorscale.map(([position, color]) => [1 - position, color] as [number, string]).reverse();
        }

        const normalizationAxis = settings.normalizationAxis || 'both';
        if (settings.normalization === 'min-max') {
          zMatrix = applyNormalization(zMatrix, 'min-max', normalizationAxis);
        } else if (settings.normalization === 'z-score') {
          zMatrix = applyNormalization(zMatrix, 'z-score', normalizationAxis);
        }

        return [
          {
            z: zMatrix,
            x: xLabels,
            y: yLabels,
            type: 'heatmap',
            colorscale: Array.isArray(colorscale)
              ? thresholdColorMap(colorscale, upperThreshold, lowerThreshold)
              : colorscale,
            hoverongaps: false,
            hovertemplate:
              `<b>ROI:</b> %{x}<br>` +
              `<b>${valueType === 'gene' ? 'Gene' : 'Protein'}:</b> %{y}<br>` +
              `<b>Mean Value:</b> %{z:.2f}<br>` +
              `<extra></extra>`
          }
        ];
      }

      // Single ROI: X = Cluster, Y = proteins/genes
      else {
        const dataMatrix: { [valueName: string]: { [clusterId: string]: number[] } } = {};
        const clusterIds = new Set<string>();
        const valueNamesSet = new Set<string>();

        for (const selection of validSelection) {
          if (!selection.data?.length) continue;

          for (const cell of selection.data) {
            const clusterId = cell.clusterId;
            clusterIds.add(clusterId);

            for (let i = 0; i < selectedValueIndices.length; i++) {
              const valueIndex = selectedValueIndices[i];
              const valueName = selectedValues[i];
              const value = getCellValue(cell, valueIndex);

              valueNamesSet.add(valueName);

              if (!dataMatrix[valueName]) {
                dataMatrix[valueName] = {};
              }

              if (!dataMatrix[valueName][clusterId]) {
                dataMatrix[valueName][clusterId] = [];
              }

              dataMatrix[valueName][clusterId].push(value ?? 0);
            }
          }
        }

        // Build heatmap matrix: rows = proteins/genes, cols = clusters
        const sortedClusterIds = Array.from(clusterIds).sort();
        const sortedValueNames = Array.from(valueNamesSet);

        let zMatrix: number[][] = [];
        const xLabels = sortedClusterIds.map((id) => t('general.clusterEntry', { index: id }));
        const yLabels = sortedValueNames;

        for (const valueName of sortedValueNames) {
          const row: number[] = [];
          for (const clusterId of sortedClusterIds) {
            const values = dataMatrix[valueName]?.[clusterId] || [];
            const meanValue = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
            row.push(meanValue);
          }
          zMatrix.push(row);
        }

        let colorscale: string | [number, string][] = settings.colorscale?.value || 'Viridis';

        if (settings.colorscale?.reversed && Array.isArray(colorscale)) {
          colorscale = colorscale.map(([position, color]) => [1 - position, color] as [number, string]).reverse();
        }

        const normalizationAxis = settings.normalizationAxis || 'both';
        if (settings.normalization === 'min-max') {
          zMatrix = applyNormalization(zMatrix, 'min-max', normalizationAxis);
        } else if (settings.normalization === 'z-score') {
          zMatrix = applyNormalization(zMatrix, 'z-score', normalizationAxis);
        }

        return [
          {
            z: zMatrix,
            x: xLabels,
            y: yLabels,
            type: 'heatmap',
            colorscale: Array.isArray(colorscale)
              ? thresholdColorMap(colorscale, upperThreshold, lowerThreshold)
              : colorscale,
            hoverongaps: false,
            hovertemplate:
              `<b>Cluster:</b> %{x}<br>` +
              `<b>${valueType === 'gene' ? 'Gene' : 'Protein'}:</b> %{y}<br>` +
              `<b>Mean Value:</b> %{z:.2f}<br>` +
              `<extra></extra>`
          }
        ];
      }
    },
    [selectedCells, segmentationMetadata, t]
  );

  return {
    parseCellsByRoi
  };
}
