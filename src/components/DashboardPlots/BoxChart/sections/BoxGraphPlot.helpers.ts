import { useCallback } from 'react';
import { useCellSegmentationLayerStore } from '../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { BoxGraphDataEntry, BoxGraphOrientation } from './BoxGraphPlot.types';
import { useTranslation } from 'react-i18next';
import { BoxGraphValueType } from './BoxGraphControls.types';
import { rgbToHex } from '../../../../utils/utils';
import { SingleMask } from '../../../../shared/types';

export function useBoxGraphPlotDataParser() {
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
      valueType: BoxGraphValueType,
      selectedvalue: string,
      addHue: boolean,
      orientation: BoxGraphOrientation
    ): BoxGraphDataEntry[] => {
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

      if (addHue) {
        const clusterData = new Map<string, { y: number[]; x: string[] }>();

        for (const selection of validSelection) {
          if (!selection.data?.length) continue;

          const roiLabel = t('general.roiEntry', { index: selection.roiId });

          for (const cell of selection.data) {
            const value = getCellValue(cell, selectedValueIndex);
            if (value === null || value === undefined) continue;

            const clusterId = cell.clusterId;
            if (!clusterData.has(clusterId)) {
              clusterData.set(clusterId, { y: [], x: [] });
            }

            const data = clusterData.get(clusterId)!;
            data.y.push(value);
            data.x.push(roiLabel);
          }
        }

        // Convert to plot data entries
        return Array.from(clusterData.entries()).map(([clusterId, data]) => ({
          name: `Cluster ${clusterId}`,
          type: 'box',
          y: data.y,
          x: data.x,
          xaxis: 'x',
          yaxis: 'y',
          boxpoints: 'outliers',
          marker: { color: parsedColormap[clusterId] },
          legendgroup: `cluster-${clusterId}`,
          showlegend: true
        }));
      }

      // Without cluster-based coloring
      const singleTrace: BoxGraphDataEntry = {
        name: selectedvalue,
        type: 'box',
        y: [],
        x: [],
        boxpoints: 'suspectedoutliers'
      };

      for (const selection of validSelection) {
        if (!selection.data?.length) continue;

        const roiLabel = t('general.roiEntry', { index: selection.roiId });

        for (const cell of selection.data) {
          const value = getCellValue(cell, selectedValueIndex);
          if (value !== null && value !== undefined) {
            singleTrace.y.push(value);
            singleTrace.x.push(roiLabel);
          }
        }
      }

      return [singleTrace];
    },
    [selectedCells, segmentationMetadata, t, cellColormapConfig]
  );

  return {
    parseCellsByRoi
  };
}
