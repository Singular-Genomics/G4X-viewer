import { useCallback } from 'react';
import { useCellSegmentationLayerStore } from '../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { HeatmapChartDataEntry } from './HeatmapChartPlot.types';
import { useTranslation } from 'react-i18next';
import { HeatmapChartValueType } from '../HeatmapChartControls';
import { SingleMask } from '../../../../../shared/types';
import { HeatmapChartSettingOptions } from '../HeatmapChartSettings';

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
    (
      rois: number[],
      valueType: HeatmapChartValueType,
      selectedvalue: string,
      settings: HeatmapChartSettingOptions
    ): HeatmapChartDataEntry[] => {
      if (!selectedCells.length || !segmentationMetadata) {
        return [];
      }

      const valueNames = valueType === 'gene' ? segmentationMetadata.geneNames : segmentationMetadata.proteinNames;
      const selectedValueIndex = valueNames.findIndex((name) => name === selectedvalue);

      if (selectedValueIndex === -1) {
        return [];
      }

      const validSelection = rois.length ? selectedCells.filter((sel) => rois.includes(sel.roiId)) : [];

      if (!validSelection.length) {
        return [];
      }

      const getCellValue = valueType === 'gene' ? getGeneValue : getProteinValue;

      // Collect all values by ROI and cluster
      const dataMatrix: { [roiId: string]: { [clusterId: string]: number[] } } = {};
      const roiIds = new Set<string>();
      const clusterIds = new Set<string>();

      for (const selection of validSelection) {
        if (!selection.data?.length) continue;

        const roiId = selection.roiId.toString();
        roiIds.add(roiId);

        if (!dataMatrix[roiId]) {
          dataMatrix[roiId] = {};
        }

        for (const cell of selection.data) {
          const value = getCellValue(cell, selectedValueIndex);

          const clusterId = cell.clusterId;
          clusterIds.add(clusterId);

          if (!dataMatrix[roiId][clusterId]) {
            dataMatrix[roiId][clusterId] = [];
          }

          dataMatrix[roiId][clusterId].push(value ?? 0);
        }
      }

      // Convert to arrays and calculate mean values
      const sortedRoiIds = Array.from(roiIds).sort((a, b) => Number(a) - Number(b));
      const sortedClusterIds = Array.from(clusterIds).sort();

      // Build z matrix (rows = clusters, cols = ROIs)
      const zMatrix: number[][] = [];
      const xLabels = sortedRoiIds.map((id) => t('general.roiEntry', { index: id }));
      const yLabels = sortedClusterIds.map((id) => t('general.clusterEntry', { index: id }));

      for (const clusterId of sortedClusterIds) {
        const row: number[] = [];
        for (const roiId of sortedRoiIds) {
          const values = dataMatrix[roiId]?.[clusterId] || [];
          const meanValue = values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 0;
          row.push(meanValue);
        }
        zMatrix.push(row);
      }

      // Prepare colorscale for Plotly
      let colorscale: string | [number, string][] = settings.colorscale?.value || 'Viridis';

      if (settings.colorscale?.reversed && Array.isArray(colorscale)) {
        // Reverse the colorscale
        colorscale = colorscale.map(([position, color]) => [1 - position, color] as [number, string]).reverse();
      }

      return [
        {
          z: zMatrix,
          x: xLabels,
          y: yLabels,
          type: 'heatmap',
          colorscale: colorscale,
          hoverongaps: false,
          hovertemplate:
            `<b>ROI:</b> %{x}<br>` + `<b>Cluster:</b> %{y}<br>` + `<b>Mean Value:</b> %{z:.2f}<br>` + `<extra></extra>`
        }
      ];
    },
    [selectedCells, segmentationMetadata, t]
  );

  return {
    parseCellsByRoi
  };
}
