import { useTranslation } from 'react-i18next';
import { useTranscriptLayerStore } from '../../stores/TranscriptLayerStore';
import { useCellSegmentationLayerStore } from '../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useCytometryGraphStore } from '../../stores/CytometryGraphStore/CytometryGraphStore';
import { useUmapGraphStore } from '../../stores/UmapGraphStore/UmapGraphStore';
import { useChannelsStore } from '../../stores/ChannelsStore/ChannelsStore';
import { useBrightfieldImagesStore } from '../../stores/BrightfieldImagesStore';
import { usePolygonDrawingStore } from '../../stores/PolygonDrawingStore';
import { useShallow } from 'zustand/react/shallow';
import { GroupedActiveFilters } from './ActiveFilters.types';

export const useActiveFilters = () => {
  const { t } = useTranslation();
  const [isGeneNameFilterActive, geneNameFilters, showFilteredPoints, isTranscriptLayerOn] = useTranscriptLayerStore(
    useShallow((store) => [
      store.isGeneNameFilterActive,
      store.geneNameFilters,
      store.showFilteredPoints,
      store.isTranscriptLayerOn
    ])
  );
  const [isCellNameFilterOn, cellNameFilters, showFilteredCells, isCellLayerOn] = useCellSegmentationLayerStore(
    useShallow((store) => [
      store.isCellNameFilterOn,
      store.cellNameFilters,
      store.showFilteredCells,
      store.isCellLayerOn
    ])
  );

  const [cytometryRanges] = useCytometryGraphStore(useShallow((store) => [store.ranges]));
  const [umapRanges] = useUmapGraphStore(useShallow((store) => [store.ranges]));

  const [channelsVisible, ids] = useChannelsStore(useShallow((store) => [store.channelsVisible, store.ids]));
  const [isLayerVisible] = useBrightfieldImagesStore(useShallow((store) => [store.isLayerVisible]));
  const [isPolygonLayerVisible] = usePolygonDrawingStore(useShallow((store) => [store.isPolygonLayerVisible]));

  const getGroupedActiveFilters = (): GroupedActiveFilters => {
    const groupedFilters: GroupedActiveFilters = {};

    // Transcript Layer Filters
    const transcriptFilters: string[] = [];
    if (isGeneNameFilterActive) {
      if (geneNameFilters.length === 1) {
        transcriptFilters.push(t('activeFilters.geneFilter', { gene: geneNameFilters[0] }));
      } else if (geneNameFilters.length > 1) {
        transcriptFilters.push(t('activeFilters.geneFilterMultiple'));
      } else {
        transcriptFilters.push(t('activeFilters.geneFilterNone'));
      }
    }
    if (showFilteredPoints) {
      transcriptFilters.push(t('activeFilters.showFilteredPoints'));
    }
    if (transcriptFilters.length > 0) {
      groupedFilters[t('activeFilters.transcriptsLayer')] = transcriptFilters;
    }

    // Segmentation Layer Filters
    const segmentationFilters: string[] = [];
    if (isCellNameFilterOn) {
      if (cellNameFilters.length === 1) {
        segmentationFilters.push(t('activeFilters.clusterFilter', { clusterId: cellNameFilters[0] }));
      } else if (cellNameFilters.length > 1) {
        segmentationFilters.push(t('activeFilters.clusterFilterMultiple'));
      } else {
        segmentationFilters.push(t('activeFilters.clusterFilterNone'));
      }
    }
    if (showFilteredCells) {
      segmentationFilters.push(t('activeFilters.showFilteredCells'));
    }
    if (segmentationFilters.length > 0) {
      groupedFilters[t('activeFilters.segmentationLayer')] = segmentationFilters;
    }

    // Flow Cytometry Filters
    if (cytometryRanges) {
      groupedFilters[t('activeFilters.flowCytometry')] = [t('activeFilters.flowCytometryRangeFilter')];
    }

    // UMAP Filters
    if (umapRanges) {
      groupedFilters[t('activeFilters.umap')] = [t('activeFilters.umapRangeFilter')];
    }

    // Channel Filters
    const actualChannelCount = ids.length;
    const hiddenChannelsCount = channelsVisible.slice(0, actualChannelCount).filter((visible) => !visible).length;
    if (hiddenChannelsCount > 0) {
      groupedFilters[t('activeFilters.channels')] = [t('activeFilters.hiddenChannels', { count: hiddenChannelsCount })];
    }

    // Disabled Layer Filters
    const disabledLayers: string[] = [];
    if (!isTranscriptLayerOn) {
      disabledLayers.push(t('activeFilters.transcriptsLayerDisabled'));
    }
    if (!isCellLayerOn) {
      disabledLayers.push(t('activeFilters.segmentationLayerDisabled'));
    }
    if (!isLayerVisible) {
      disabledLayers.push(t('activeFilters.brightfieldLayerDisabled'));
    }
    if (!isPolygonLayerVisible) {
      disabledLayers.push(t('activeFilters.polygonLayerDisabled'));
    }
    if (disabledLayers.length > 0) {
      groupedFilters[t('activeFilters.disabledLayers')] = disabledLayers;
    }

    return groupedFilters;
  };

  const groupedActiveFilters = getGroupedActiveFilters();
  const hasActiveFilters = Object.keys(groupedActiveFilters).length > 0;

  return { groupedActiveFilters, hasActiveFilters };
};
