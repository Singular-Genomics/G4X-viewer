import { useTranscriptLayerStore } from '../../stores/TranscriptLayerStore';
import { useCellSegmentationLayerStore } from '../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useCytometryGraphStore } from '../../stores/CytometryGraphStore/CytometryGraphStore';
import { useUmapGraphStore } from '../../stores/UmapGraphStore/UmapGraphStore';
import { useChannelsStore } from '../../stores/ChannelsStore/ChannelsStore';
import { useShallow } from 'zustand/react/shallow';

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

  const getActiveFilters = () => {
    const activeFilters: string[] = [];

    // Transcript Layer Filters
    if (isGeneNameFilterActive && geneNameFilters.length > 0) {
      activeFilters.push(`Gene names (${geneNameFilters.length})`);
    }
    if (showFilteredPoints) {
      activeFilters.push('Show filtered points');
    }

    // Cell Segmentation Filters
    if (isCellNameFilterOn && cellNameFilters.length > 0) {
      activeFilters.push(`Cell names (${cellNameFilters.length})`);
    }
    if (showFilteredCells) {
      activeFilters.push('Show filtered cells');
    }

    // Cytometry Graph Filters
    if (cytometryRanges) {
      activeFilters.push('Flow Cytometry range filter');
    }
    if (cytometryProteinNames.xAxis || cytometryProteinNames.yAxis) {
      const proteinCount = [cytometryProteinNames.xAxis, cytometryProteinNames.yAxis].filter(Boolean).length;
      activeFilters.push(`Flow Cytometry proteins (${proteinCount})`);
    }

    // UMAP Graph Filters
    if (umapRanges) {
      activeFilters.push('UMAP range filter');
    }

    // Channel visibility filters (only show disabled channels)
    const hiddenChannelsCount = channelsVisible.filter((visible) => !visible).length;
    if (hiddenChannelsCount > 0) {
      activeFilters.push(`Hidden channels (${hiddenChannelsCount})`);
    }

    return activeFilters;
  };

  const activeFilters = getActiveFilters();
  const hasActiveFilters = activeFilters.length > 0;

  return { activeFilters, hasActiveFilters };
};
