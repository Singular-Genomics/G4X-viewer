import { useCallback } from 'react';
import { useCellSegmentationLayerStore } from '../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { BoxChartDataEntry, BoxChartOrientation } from './BoxChartPlot.types';
import { useTranslation } from 'react-i18next';
import { BoxChartHueValueOptions, BoxChartValueType } from '../BoxChartControls/BoxChartControls.types';
import { generatePolygonColor, rgbToHex } from '../../../../../utils/utils';
import { SingleMask } from '../../../../../shared/types';
import { BoxChartDataMode } from '../BoxChartSettings/BoxChartSettings.types';

export function useBoxChartPlotDataParser() {
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
      valueType: BoxChartValueType,
      selectedvalue: string,
      hueValue: BoxChartHueValueOptions,
      orientation: BoxChartOrientation,
      dataMode: BoxChartDataMode
    ): BoxChartDataEntry[] => {
      if (!selectedCells.length || !segmentationMetadata) {
        return [];
      }

      const selectedValueIndex = (
        valueType === 'gene' ? segmentationMetadata.geneNames : segmentationMetadata.proteinNames
      ).findIndex((name) => name === selectedvalue);

      const validSelection = rois ? selectedCells.filter((sel) => rois.includes(sel.roiId)) : [];
      const parsedColormap = cellColormapConfig.reduce(
        (acc, item) => {
          acc[item.clusterId] = rgbToHex(item.color);
          return acc;
        },
        {} as Record<string, string>
      );

      const getCellValue = valueType === 'gene' ? getGeneValue : getProteinValue;

      if (hueValue === 'clusterId') {
        const clusterData = new Map<string, { y: number[]; x: string[] }>();

        for (const selection of validSelection) {
          if (!selection.data?.length) continue;

          for (const cell of selection.data) {
            const value = getCellValue(cell, selectedValueIndex);
            if (value === null || value === undefined) continue;

            if (!clusterData.has(cell.clusterId)) {
              clusterData.set(cell.clusterId, { y: [], x: [] });
            }

            const data = clusterData.get(cell.clusterId)!;
            data.y.push(value);
            data.x.push(t('general.roiEntry', { index: selection.roiId }));
          }
        }

        // Convert to plot data entries
        return Array.from(clusterData.entries()).map(([clusterId, data]) => ({
          name: t('general.clusterEntry', { index: clusterId }),
          type: 'box',
          ...(orientation === 'v' ? { y: data.y, x: data.x } : { x: data.y, y: data.x }),
          ...(dataMode !== 'none' ? { boxpoints: dataMode } : {}),
          boxpoints: dataMode !== 'none' && dataMode,
          marker: { color: parsedColormap[clusterId] },
          legendgroup: t('general.clusterEntry', { index: clusterId }),
          showlegend: true,
          orientation: orientation
        }));
      } else if (hueValue === 'roi') {
        const roiData = new Map<string, { y: number[]; x: string[] }>();

        for (const selection of validSelection) {
          if (!selection.data?.length) continue;

          if (!roiData.has(selection.roiId.toString())) {
            roiData.set(selection.roiId.toString(), { y: [], x: [] });
          }

          for (const cell of selection.data) {
            const value = getCellValue(cell, selectedValueIndex);
            if (value === null || value === undefined) continue;

            const data = roiData.get(selection.roiId.toString())!;
            data.y.push(value);
            data.x.push(t('general.clusterEntry', { index: cell.clusterId }));
          }
        }

        // Convert to plot data entries
        return Array.from(roiData.entries()).map(([roiId, data]) => ({
          name: t('general.roiEntry', { index: roiId }),
          type: 'box',
          ...(orientation === 'v' ? { y: data.y, x: data.x } : { x: data.y, y: data.x }),
          boxpoints: dataMode !== 'none' && dataMode,
          marker: { color: rgbToHex(generatePolygonColor(Number(roiId) - 1)) },
          legendgroup: t('general.roiEntry', { index: roiId }),
          showlegend: true,
          orientation: orientation
        }));
      }

      // Without cluster-based coloring
      const data: { x: string[]; y: number[] } = { x: [], y: [] };

      for (const selection of validSelection) {
        if (!selection.data?.length) continue;

        const roiLabel = t('general.roiEntry', { index: selection.roiId });

        for (const cell of selection.data) {
          const value = getCellValue(cell, selectedValueIndex);
          if (value !== null && value !== undefined) {
            data.y.push(value);
            data.x.push(roiLabel);
          }
        }
      }

      return [
        {
          name: selectedvalue,
          type: 'box',
          ...(orientation === 'v' ? { y: data.y, x: data.x } : { x: data.y, y: data.x }),
          boxpoints: dataMode !== 'none' && dataMode,
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
