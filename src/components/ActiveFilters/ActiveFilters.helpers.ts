import { useTranslation } from 'react-i18next';
import { useTranscriptLayerStore } from '../../stores/TranscriptLayerStore';
import { useCellSegmentationLayerStore } from '../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useCytometryGraphStore } from '../../stores/CytometryGraphStore/CytometryGraphStore';
import { useUmapGraphStore } from '../../stores/UmapGraphStore/UmapGraphStore';
import { useChannelsStore } from '../../stores/ChannelsStore/ChannelsStore';
import { useShallow } from 'zustand/react/shallow';
import { GroupedActiveFilters } from './ActiveFilters.types';

export const useActiveFilters = () => {
  const { t } = useTranslation();
  const [isGeneNameFilterActive, geneNameFilters, showFilteredPoints] = useTranscriptLayerStore(
    useShallow((store) => [store.isGeneNameFilterActive, store.geneNameFilters, store.showFilteredPoints])
  );
  const [isCellNameFilterOn, cellNameFilters, showFilteredCells] = useCellSegmentationLayerStore(
    useShallow((store) => [store.isCellNameFilterOn, store.cellNameFilters, store.showFilteredCells])
  );

  const [cytometryRanges] = useCytometryGraphStore(useShallow((store) => [store.ranges]));
  const [umapRanges] = useUmapGraphStore(useShallow((store) => [store.ranges]));

  const [channelsVisible] = useChannelsStore(useShallow((store) => [store.channelsVisible]));

  const getGroupedActiveFilters = (): GroupedActiveFilters => {
    const groupedFilters: GroupedActiveFilters = {};

    // Transcript Layer Filters
    const transcriptFilters: string[] = [];
    if (isGeneNameFilterActive && geneNameFilters.length > 0) {
      transcriptFilters.push(t('activeFilters.geneNames', { count: geneNameFilters.length }));
    }
    if (showFilteredPoints) {
      transcriptFilters.push(t('activeFilters.showFilteredPoints'));
    }
    if (transcriptFilters.length > 0) {
      groupedFilters[t('activeFilters.transcriptsLayer')] = transcriptFilters;
    }

    // Segmentation Layer Filters
    const segmentationFilters: string[] = [];
    if (isCellNameFilterOn && cellNameFilters.length > 0) {
      segmentationFilters.push(t('activeFilters.cellNames', { count: cellNameFilters.length }));
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
    const hiddenChannelsCount = channelsVisible.filter((visible) => !visible).length;
    if (hiddenChannelsCount > 0) {
      groupedFilters[t('activeFilters.channels')] = [t('activeFilters.hiddenChannels', { count: hiddenChannelsCount })];
    }

    return groupedFilters;
  };

  const groupedActiveFilters = getGroupedActiveFilters();
  const hasActiveFilters = Object.keys(groupedActiveFilters).length > 0;

  return { groupedActiveFilters, hasActiveFilters };
};
