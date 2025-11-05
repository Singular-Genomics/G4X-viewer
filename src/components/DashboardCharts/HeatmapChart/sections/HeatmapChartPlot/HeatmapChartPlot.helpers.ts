import { useCallback } from 'react';
import { useCellSegmentationLayerStore } from '../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { HeatmapChartDataEntry } from './HeatmapChartPlot.types';
import { useTranslation } from 'react-i18next';
import { HeatmapChartValueType } from '../HeatmapChartControls';
import { SingleMask } from '../../../../../shared/types';
import { HeatmapChartSettingOptions } from '../HeatmapChartSettings';
import { thresholdColorMap } from '../../../../../shared/components/GxColorscaleSlider';

export function useHeatmapChartPlotDataParser() {
  const { t } = useTranslation();
  const { selectedCells, segmentationMetadata } = useCellSegmentationLayerStore();

  const getGeneValue = (cell: SingleMask, selectedValueIndex: number): number | null => {
    const idx = cell.nonzeroGeneIndices.findIndex((index: number) => index === selectedValueIndex);
    return idx === -1 ? null : cell.nonzeroGeneValues[idx];
  };

  const getProteinValue = (cell: SingleMask, selectedValueIndex: number): number =>
    cell.proteinValues[selectedValueIndex];

  const normalizeMinMax = (zMatrix: number[][]) => {
    if (!zMatrix.length) {
      return zMatrix;
    }

    let minValue = Infinity;
    let maxValue = -Infinity;

    // Find min and max values in the matrix
    for (const row of zMatrix) {
      for (const value of row) {
        if (value < minValue) minValue = value;
        else if (value > maxValue) maxValue = value;
      }
    }

    for (let i = 0; i < zMatrix.length; i++) {
      for (let j = 0; j < zMatrix[i].length; j++) {
        zMatrix[i][j] = (zMatrix[i][j] - minValue) / (maxValue - minValue);
      }
    }

    return zMatrix;
  };

  const normlaizeZScore = (zMatrix: number[][]) => {
    const flattenedValues = zMatrix.flat();

    if (flattenedValues.length === 0) {
      return zMatrix;
    }

    const mean = flattenedValues.reduce((sum, curr) => sum + curr, 0) / flattenedValues.length;
    const standardDeviation = Math.sqrt(
      flattenedValues.reduce((sum, curr) => sum + Math.pow(curr - mean, 2)) / flattenedValues.length
    );

    for (let i = 0; i < zMatrix.length; i++) {
      for (let j = 0; j < zMatrix[i].length; j++) {
        zMatrix[i][j] = (zMatrix[i][j] - mean) / standardDeviation;
      }
    }

    return zMatrix;
  };

  const parseCellsByRoi = useCallback(
    (
      rois: number[],
      valueType: HeatmapChartValueType,
      selectedValues: string[],
      settings: HeatmapChartSettingOptions,
      upperThreshold?: number,
      lowerThreshold?: number
    ): HeatmapChartDataEntry[] => {
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

      const validSelection = rois.length ? selectedCells.filter((sel) => rois.includes(sel.roiId)) : [];

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
        const sortedRoiIds = Array.from(roiIds).sort((a, b) => Number(a) - Number(b));
        const sortedValueNames = Array.from(valueNamesSet);

        let zMatrix: number[][] = [];
        const xLabels = sortedRoiIds.map((id) => t('general.roiEntry', { index: id }));
        const yLabels = sortedValueNames;

        for (const valueName of sortedValueNames) {
          const row: number[] = [];
          for (const roiId of sortedRoiIds) {
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

        if (settings.normalization === 'min-max') {
          zMatrix = normalizeMinMax(zMatrix);
        } else if (settings.normalization === 'z-score') {
          zMatrix = normlaizeZScore(zMatrix);
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

        const zMatrix: number[][] = [];
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

        // Apply colorscale settings
        let colorscale: string | [number, string][] = settings.colorscale?.value || 'Viridis';

        if (settings.colorscale?.reversed && Array.isArray(colorscale)) {
          colorscale = colorscale.map(([position, color]) => [1 - position, color] as [number, string]).reverse();
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
