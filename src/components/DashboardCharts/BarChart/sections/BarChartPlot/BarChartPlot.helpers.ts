import { useCallback } from 'react';
import { useCellSegmentationLayerStore } from '../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { BarChartDataEntry, BarChartOrientation } from './BarChartPlot.types';
import { useTranslation } from 'react-i18next';
import { BarChartHueValueOptions, BarChartValueType } from '../BarChartControls';
import { generatePolygonColor, rgbToHex } from '../../../../../utils/utils';
import { SingleMask } from '../../../../../shared/types';

export function useBarChartPlotDataParser() {
  const { t } = useTranslation();
  const { selectedCells, segmentationMetadata, cellColormapConfig } = useCellSegmentationLayerStore();

  const getGeneValue = (cell: SingleMask, selectedValueIndex: number): number | null => {
    const idx = cell.nonzeroGeneIndices.findIndex((index: number) => index === selectedValueIndex);
    return idx === -1 ? null : cell.nonzeroGeneValues[idx];
  };

  const getProteinValue = (cell: SingleMask, selectedValueIndex: number): number =>
    cell.proteinValues[selectedValueIndex];

  const parseCellsByRoi = useCallback(
    (
      rois: number[],
      valueType: BarChartValueType,
      selectedvalue: string,
      hueValue: BarChartHueValueOptions,
      orientation: BarChartOrientation
    ): BarChartDataEntry[] => {
      if (!selectedCells.length || !segmentationMetadata) {
        return [];
      }

      const selectedValueIndex = (
        valueType === 'gene' ? segmentationMetadata.geneNames : segmentationMetadata.proteinNames
      ).findIndex((name) => name === selectedvalue);

      const cellsByRoiId = new Map(selectedCells.map((sel) => [sel.roiId, sel]));
      const validSelection = rois
        ? rois.map((roiId) => cellsByRoiId.get(roiId)).filter((sel) => sel !== undefined)
        : [];
      const parsedColormap = cellColormapConfig.reduce(
        (acc, item) => {
          acc[item.clusterId] = rgbToHex(item.color);
          return acc;
        },
        {} as Record<string, string>
      );

      const getCellValue = valueType === 'gene' ? getGeneValue : getProteinValue;

      if (hueValue === 'clusterId') {
        const clusterData = new Map<string, { values: number[]; labels: string[] }>();

        for (const selection of validSelection) {
          if (!selection.data?.length) continue;

          for (const cell of selection.data) {
            const value = getCellValue(cell, selectedValueIndex);

            if (!clusterData.has(cell.clusterId)) {
              clusterData.set(cell.clusterId, { values: [], labels: [] });
            }

            const data = clusterData.get(cell.clusterId)!;
            data.values.push(value ?? 0);
            data.labels.push(t('general.roiEntry', { index: selection.roiId }));
          }
        }

        // Calculate mean values per ROI per cluster
        const aggregatedData = new Map<string, Map<string, number[]>>();

        for (const [clusterId, data] of clusterData.entries()) {
          const roiMap = new Map<string, number[]>();

          for (let i = 0; i < data.values.length; i++) {
            const roiLabel = data.labels[i];
            if (!roiMap.has(roiLabel)) {
              roiMap.set(roiLabel, []);
            }
            roiMap.get(roiLabel)!.push(data.values[i]);
          }

          aggregatedData.set(clusterId, roiMap);
        }

        // Convert to plot data entries with mean values
        return Array.from(aggregatedData.entries()).map(([clusterId, roiMap]) => {
          const x: string[] = [];
          const y: number[] = [];
          const counts: number[] = [];

          for (const [roiLabel, values] of roiMap.entries()) {
            x.push(roiLabel);
            y.push(values.reduce((sum, val) => sum + val, 0) / values.length);
            counts.push(values.length);
          }

          const hovertemplate =
            orientation === 'v'
              ? `<b>Cluster:</b> ${clusterId}<br><b>ROI:</b> %{x}<br><b>Mean Value:</b> %{y:.2f}<br><b>Count:</b> %{customdata}<extra></extra>`
              : `<b>Cluster:</b> ${clusterId}<br><b>ROI:</b> %{y}<br><b>Mean Value:</b> %{x:.2f}<br><b>Count:</b> %{customdata}<extra></extra>`;

          return {
            name: t('general.clusterEntry', { index: clusterId }),
            type: 'bar',
            ...(orientation === 'v' ? { x, y } : { x: y, y: x }),
            customdata: counts,
            hovertemplate,
            marker: { color: parsedColormap[clusterId] },
            legendgroup: t('general.clusterEntry', { index: clusterId }),
            showlegend: true,
            orientation: orientation
          };
        });
      } else if (hueValue === 'roi') {
        const roiData = new Map<string, { values: number[]; labels: string[] }>();

        for (const selection of validSelection) {
          if (!selection.data?.length) continue;

          if (!roiData.has(selection.roiId.toString())) {
            roiData.set(selection.roiId.toString(), { values: [], labels: [] });
          }

          for (const cell of selection.data) {
            const value = getCellValue(cell, selectedValueIndex);

            const data = roiData.get(selection.roiId.toString())!;
            data.values.push(value ?? 0);
            data.labels.push(t('general.clusterEntry', { index: cell.clusterId }));
          }
        }

        // Calculate mean values per cluster per ROI
        const aggregatedData = new Map<string, Map<string, number[]>>();

        for (const [roiId, data] of roiData.entries()) {
          const clusterMap = new Map<string, number[]>();

          for (let i = 0; i < data.values.length; i++) {
            const clusterLabel = data.labels[i];
            if (!clusterMap.has(clusterLabel)) {
              clusterMap.set(clusterLabel, []);
            }
            clusterMap.get(clusterLabel)!.push(data.values[i]);
          }

          aggregatedData.set(roiId, clusterMap);
        }

        // Convert to plot data entries with mean values
        return rois
          .filter((roiId) => aggregatedData.has(roiId.toString()))
          .map((roiId) => {
            const clusterMap = aggregatedData.get(roiId.toString())!;
            const x: string[] = [];
            const y: number[] = [];
            const counts: number[] = [];

            for (const [clusterLabel, values] of clusterMap.entries()) {
              x.push(clusterLabel);
              y.push(values.reduce((sum, val) => sum + val, 0) / values.length);
              counts.push(values.length);
            }

            const hovertemplate =
              orientation === 'v'
                ? `<b>ROI:</b> ${roiId}<br><b>Cluster:</b> %{x}<br><b>Mean Value:</b> %{y:.2f}<br><b>Count:</b> %{customdata}<extra></extra>`
                : `<b>ROI:</b> ${roiId}<br><b>Cluster:</b> %{y}<br><b>Mean Value:</b> %{x:.2f}<br><b>Count:</b> %{customdata}<extra></extra>`;

            return {
              name: t('general.roiEntry', { index: roiId }),
              type: 'bar',
              ...(orientation === 'v' ? { x, y } : { x: y, y: x }),
              customdata: counts,
              hovertemplate,
              marker: { color: rgbToHex(generatePolygonColor(Number(roiId) - 1)) },
              legendgroup: t('general.roiEntry', { index: roiId }),
              showlegend: true,
              orientation: orientation
            };
          });
      }

      // Without hue - aggregate by ROI
      const roiMap = new Map<string, number[]>();

      for (const selection of validSelection) {
        if (!selection.data?.length) continue;

        const roiLabel = t('general.roiEntry', { index: selection.roiId });

        if (!roiMap.has(roiLabel)) {
          roiMap.set(roiLabel, []);
        }

        for (const cell of selection.data) {
          const value = getCellValue(cell, selectedValueIndex);
          roiMap.get(roiLabel)!.push(value ?? 0);
        }
      }

      const x: string[] = [];
      const y: number[] = [];
      const counts: number[] = [];

      for (const [roiLabel, values] of roiMap.entries()) {
        x.push(roiLabel);
        y.push(values.reduce((sum, val) => sum + val, 0) / values.length);
        counts.push(values.length);
      }

      const hovertemplate =
        orientation === 'v'
          ? `<b>${valueType === 'gene' ? 'Gene' : 'Protein'}:</b> ${selectedvalue}<br><b>ROI:</b> %{x}<br><b>Mean Value:</b> %{y:.2f}<br><b>Count:</b> %{customdata}<extra></extra>`
          : `<b>${valueType === 'gene' ? 'Gene' : 'Protein'}:</b> ${selectedvalue}<br><b>ROI:</b> %{y}<br><b>Mean Value:</b> %{x:.2f}<br><b>Count:</b> %{customdata}<extra></extra>`;

      return [
        {
          name: selectedvalue,
          type: 'bar',
          ...(orientation === 'v' ? { x, y } : { x: y, y: x }),
          customdata: counts,
          hovertemplate,
          orientation: orientation,
          showlegend: false
        }
      ];
    },
    [selectedCells, segmentationMetadata, t, cellColormapConfig]
  );

  return {
    parseCellsByRoi
  };
}
