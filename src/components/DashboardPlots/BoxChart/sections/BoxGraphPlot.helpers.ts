import { useCallback } from 'react';
import { useCellSegmentationLayerStore } from '../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { BoxGraphDataEntry, BoxGraphOrientation } from './BoxGraphPlot.types';
import { useTranslation } from 'react-i18next';
import { BoxGraphValueType } from './BoxGraphControls.types';

export function useBoxGraphPlotDataParser() {
  const { t } = useTranslation();
  const { selectedCells, segmentationMetadata, cellColormapConfig } = useCellSegmentationLayerStore();

  const parseCellsByRoi = useCallback(
    (
      rois: number[],
      valueType: BoxGraphValueType,
      selectedvalue: string,
      addHue: boolean,
      orientation: BoxGraphOrientation
    ): BoxGraphDataEntry[] => {
      const plotData: BoxGraphDataEntry[] = [];

      if (!selectedCells.length || !segmentationMetadata) {
        return plotData;
      }

      const selectedValueIndex = (
        valueType === 'gene' ? segmentationMetadata.geneNames : segmentationMetadata.proteinNames
      ).findIndex((geneName) => geneName === selectedvalue);

      const allClusterIds = new Set<string>();

      //1. Filter out all selection which ROIs we exclude
      const validSelection = rois ? selectedCells.filter((selection) => rois.includes(selection.roiId)) : [];

      //2. If we use hue we will need cluster ids
      if (addHue) {
        return plotData;
      } else {
        const singleTrace: BoxGraphDataEntry = {
          name: selectedvalue,
          type: 'box',
          y: [],
          x: [],
          boxpoints: 'suspectedoutliers'
        };

        if (valueType === 'gene') {
          for (const selection of validSelection) {
            if (!selection.data || !selection.data.length) {
              continue;
            }

            for (const cell of selection.data) {
              const geneValueIndex = cell.nonzeroGeneIndices.findIndex((index) => index === selectedValueIndex);
              if (geneValueIndex === -1) {
                continue;
              }

              singleTrace.y.push(cell.nonzeroGeneValues[geneValueIndex]);
              singleTrace.x.push(t('general.roiEntry', { index: selection.roiId }));
            }
          }

          return [singleTrace];
        } else {
          for (const selection of validSelection) {
            if (!selection.data || !selection.data.length) {
              continue;
            }

            for (const cell of selection.data) {
              singleTrace.y.push(cell.proteinValues[selectedValueIndex]);
              singleTrace.x.push(t('general.roiEntry', { index: selection.roiId }));
            }
          }

          return [singleTrace];
        }
      }
    },
    [selectedCells, segmentationMetadata, t]
  );

  return {
    parseCellsByRoi
  };
}
