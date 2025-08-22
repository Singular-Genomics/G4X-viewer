import { useTranscriptLayerStore } from '../../stores/TranscriptLayerStore';
import { useCellSegmentationLayerStore } from '../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useCytometryGraphStore } from '../../stores/CytometryGraphStore/CytometryGraphStore';
import { useUmapGraphStore } from '../../stores/UmapGraphStore/UmapGraphStore';
import { useChannelsStore } from '../../stores/ChannelsStore/ChannelsStore';
import { useShallow } from 'zustand/react/shallow';
import { GroupedActiveFilters } from './ActiveFilters.types';

export const useActiveFilters = () => {
  const [isGeneNameFilterActive, geneNameFilters, showFilteredPoints] = useTranscriptLayerStore(
    useShallow((store) => [store.isGeneNameFilterActive, store.geneNameFilters, store.showFilteredPoints])
  );
  const [isCellNameFilterOn, cellNameFilters, showFilteredCells] = useCellSegmentationLayerStore(
    useShallow((store) => [store.isCellNameFilterOn, store.cellNameFilters, store.showFilteredCells])
  );

  const [cytometryRanges, cytometryProteinNames] = useCytometryGraphStore(
    useShallow((store) => [store.ranges, store.proteinNames])
  );
  const [umapRanges] = useUmapGraphStore(useShallow((store) => [store.ranges]));

  const [channelsVisible] = useChannelsStore(useShallow((store) => [store.channelsVisible]));

  const getGroupedActiveFilters = (): GroupedActiveFilters => {
    const groupedFilters: GroupedActiveFilters = {};

    // Transcript Layer Filters
    const transcriptFilters: string[] = [];
    if (isGeneNameFilterActive && geneNameFilters.length > 0) {
      transcriptFilters.push(`Gene names (${geneNameFilters.length})`);
    }
    if (showFilteredPoints) {
      transcriptFilters.push('Show filtered points');
    }
    if (transcriptFilters.length > 0) {
      groupedFilters['Transcripts Layer'] = transcriptFilters;
    }

    // Segmentation Layer Filters
    const segmentationFilters: string[] = [];
    if (isCellNameFilterOn && cellNameFilters.length > 0) {
      segmentationFilters.push(`Cell names (${cellNameFilters.length})`);
    }
    if (showFilteredCells) {
      segmentationFilters.push('Show filtered cells');
    }
    if (segmentationFilters.length > 0) {
      groupedFilters['Segmentation Layer'] = segmentationFilters;
    }

    // Flow Cytometry Filters
    const cytometryFilters: string[] = [];
    if (cytometryRanges) {
      cytometryFilters.push('Flow Cytometry range filter');
    }
    if (cytometryProteinNames.xAxis || cytometryProteinNames.yAxis) {
      const proteinCount = [cytometryProteinNames.xAxis, cytometryProteinNames.yAxis].filter(Boolean).length;
      cytometryFilters.push(`Flow Cytometry proteins (${proteinCount})`);
    }
    if (cytometryFilters.length > 0) {
      groupedFilters['Flow Cytometry'] = cytometryFilters;
    }

    // UMAP Filters
    if (umapRanges) {
      groupedFilters['UMAP'] = ['UMAP range filter'];
    }

    // Channel Filters
    const hiddenChannelsCount = channelsVisible.filter((visible) => !visible).length;
    if (hiddenChannelsCount > 0) {
      groupedFilters['Channels'] = [`Hidden channels (${hiddenChannelsCount})`];
    }

    return groupedFilters;
  };

  const groupedActiveFilters = getGroupedActiveFilters();
  const hasActiveFilters = Object.keys(groupedActiveFilters).length > 0;

  return { groupedActiveFilters, hasActiveFilters };
};
