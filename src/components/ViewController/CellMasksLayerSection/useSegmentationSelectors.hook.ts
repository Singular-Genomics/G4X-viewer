import { useCallback, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useCellSegmentationLayerStore } from '../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useZarrDataStore } from '../../../stores/ZarrDataStore/ZarrDataStore';
import { buildColormap } from '../../../utils/ZarrCellsLoader';

export const useSegmentationSelectors = () => {
  const [isLoading, setIsLoading] = useState(false);

  const zarrDataSet = useZarrDataStore((store) => store.zarrDataSet);

  const [
    availableSegmentations,
    selectedSegmentationLabel,
    availableClusterLabels,
    selectedClusterLabelKey,
    cellMasksData
  ] = useCellSegmentationLayerStore(
    useShallow((store) => [
      store.availableSegmentations,
      store.selectedSegmentationLabel,
      store.availableClusterLabels,
      store.selectedClusterLabelKey,
      store.cellMasksData
    ])
  );

  const handleSegmentationChange = useCallback(
    async (newLabel: string) => {
      if (!zarrDataSet || newLabel === selectedSegmentationLabel) return;

      const segmentationOption = availableSegmentations.find((s) => s.label === newLabel);
      if (!segmentationOption) return;

      setIsLoading(true);
      try {
        const cellsData = await zarrDataSet.fetchCellsData(segmentationOption.folderName);

        useCellSegmentationLayerStore.setState({
          cellMasksData: cellsData.cellMasks,
          cellColormapConfig: cellsData.colormap,
          umapDataAvailable: cellsData.cellMasks.some(
            (mask) => mask.umapValues.umapX !== 0 || mask.umapValues.umapY !== 0
          ),
          segmentationMetadata: cellsData.metadata,
          availableClusterLabels: cellsData.clusterLabels,
          selectedSegmentationLabel: newLabel,
          selectedClusterLabelKey: cellsData.clusterLabels[0].key,
          cellNameFilters: [],
          selectedCells: []
        });
      } finally {
        setIsLoading(false);
      }
    },
    [zarrDataSet, selectedSegmentationLabel, availableSegmentations]
  );

  const handleClusterLabelChange = useCallback(
    async (newKey: string) => {
      if (!zarrDataSet || newKey === selectedClusterLabelKey || !cellMasksData) return;

      const targetLabel = availableClusterLabels.find((l) => l.key === newKey);
      if (!targetLabel) return;

      const segmentationOption = availableSegmentations.find((s) => s.label === selectedSegmentationLabel);
      if (!segmentationOption) return;

      setIsLoading(true);
      try {
        const { data: clusterIdsRaw, columnCount } = await zarrDataSet.fetchClusterIds(segmentationOption.folderName);

        const updatedMasks = cellMasksData.map((mask, i) => {
          const flatIndex = i * columnCount + targetLabel.index;
          const clusterId = clusterIdsRaw.get ? clusterIdsRaw.get(flatIndex) : String(clusterIdsRaw[flatIndex]);
          return { ...mask, clusterId };
        });

        useCellSegmentationLayerStore.setState({
          cellMasksData: updatedMasks,
          cellColormapConfig: buildColormap(targetLabel),
          selectedClusterLabelKey: newKey,
          cellNameFilters: [],
          selectedCells: []
        });
      } finally {
        setIsLoading(false);
      }
    },
    [
      zarrDataSet,
      selectedClusterLabelKey,
      cellMasksData,
      availableClusterLabels,
      availableSegmentations,
      selectedSegmentationLabel
    ]
  );

  return {
    isLoading,
    availableSegmentations,
    selectedSegmentationLabel,
    availableClusterLabels,
    selectedClusterLabelKey,
    handleSegmentationChange,
    handleClusterLabelChange
  };
};
