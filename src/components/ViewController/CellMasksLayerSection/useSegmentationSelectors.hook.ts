import { useCallback, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useCellSegmentationLayerStore } from '../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useZarrDataStore } from '../../../stores/ZarrDataStore/ZarrDataStore';
import { ZarrDataSet } from '../../../utils/ZarrDataSet';
import { buildColormap } from '../../../utils/ZarrCellsLoader';
import { open, FetchStore, get } from 'zarrita';
import { createZarrPaths } from '../../../utils/ZarrPaths';

export const useSegmentationSelectors = () => {
  const [isLoading, setIsLoading] = useState(false);

  const zarrUrl = useZarrDataStore((store) => store.zarrUrl);

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
      if (!zarrUrl || newLabel === selectedSegmentationLabel) return;

      const segmentationOption = availableSegmentations.find((s) => s.label === newLabel);
      if (!segmentationOption) return;

      setIsLoading(true);
      try {
        const zarrDataSet = new ZarrDataSet(zarrUrl);
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
    [zarrUrl, selectedSegmentationLabel, availableSegmentations]
  );

  const handleClusterLabelChange = useCallback(
    async (newKey: string) => {
      if (!zarrUrl || newKey === selectedClusterLabelKey || !cellMasksData) return;

      const targetLabel = availableClusterLabels.find((l) => l.key === newKey);
      if (!targetLabel) return;

      const segmentationOption = availableSegmentations.find((s) => s.label === selectedSegmentationLabel);
      if (!segmentationOption) return;

      setIsLoading(true);
      try {
        const paths = createZarrPaths(zarrUrl);
        const cellsBaseUrl = `${paths.cells.base()}/${segmentationOption.folderName}`;

        const clusterIdArray = await open(new FetchStore(`${cellsBaseUrl}/metadata/cluster_id`), { kind: 'array' });
        const clusterIdsChunk = await get(clusterIdArray);

        const clusterIdsRaw = clusterIdsChunk.data as any;
        const columnCount = clusterIdsChunk.shape[1];

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
      zarrUrl,
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
