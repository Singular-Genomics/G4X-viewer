import { useTranslation } from 'react-i18next';
import { useTranscriptLayerStore } from '../../stores/TranscriptLayerStore';
import { useCellSegmentationLayerStore } from '../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useCytometryGraphStore } from '../../stores/CytometryGraphStore/CytometryGraphStore';
import { useUmapGraphStore } from '../../stores/UmapGraphStore/UmapGraphStore';
import { useChannelsStore } from '../../stores/ChannelsStore/ChannelsStore';
import { useBrightfieldImagesStore } from '../../stores/BrightfieldImagesStore';
import { usePolygonDrawingStore } from '../../stores/PolygonDrawingStore';
import { useShallow } from 'zustand/react/shallow';
import { GroupedActiveFilters } from './ActiveFiltersPanel.types';

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

  const [channelsVisible, ids] = useChannelsStore(useShallow((store) => [store.channelsVisible, store.ids]));

  const getGroupedActiveFilters = (): GroupedActiveFilters => {
    const groupedFilters: GroupedActiveFilters = {};

    // Transcript Layer Filters
    const transcriptFilters: string[] = [];
    if (isGeneNameFilterActive) {
      transcriptFilters.push(
        t('activeFilters.geneFilter', { count: geneNameFilters.length, gene: geneNameFilters[0] })
      );
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
      segmentationFilters.push(
        t('activeFilters.clusterFilter', { count: cellNameFilters.length, clusterId: cellNameFilters[0] })
      );
    }
    if (showFilteredCells) {
      segmentationFilters.push(t('activeFilters.showFilteredCells'));
    }
    // Flow Cytometry Filters
    if (cytometryRanges) {
      segmentationFilters.push(t('activeFilters.flowCytometryRangeFilter'));
    }
    // UMAP Filters
    if (umapRanges) {
      segmentationFilters.push(t('activeFilters.umapRangeFilter'));
    }
    if (segmentationFilters.length > 0) {
      groupedFilters[t('activeFilters.segmentationLayer')] = segmentationFilters;
    }

    // Channel Filters
    const actualChannelCount = ids.length;
    const hiddenChannelsCount = channelsVisible.slice(0, actualChannelCount).filter((visible) => !visible).length;
    if (hiddenChannelsCount > 0) {
      groupedFilters[t('activeFilters.channels')] = [t('activeFilters.hiddenChannels', { count: hiddenChannelsCount })];
    }

    return groupedFilters;
  };

  const groupedActiveFilters = getGroupedActiveFilters();
  const hasActiveFilters = Object.keys(groupedActiveFilters).length > 0;

  return { groupedActiveFilters, hasActiveFilters };
};

export const useHiddenLayers = () => {
  const { t } = useTranslation();
  const isTranscriptLayerOn = useTranscriptLayerStore((store) => store.isTranscriptLayerOn);
  const isCellLayerOn = useCellSegmentationLayerStore((store) => store.isCellLayerOn);
  const isLayerVisible = useBrightfieldImagesStore((store) => store.isLayerVisible);
  const isPolygonLayerVisible = usePolygonDrawingStore((store) => store.isPolygonLayerVisible);

  const getHiddenLayers = () => {
    const hiddenLayers: string[] = [];
    if (!isTranscriptLayerOn) {
      hiddenLayers.push(t('hiddenLayers.transcriptLayer'));
    }
    if (!isCellLayerOn) {
      hiddenLayers.push(t('hiddenLayers.segmentationLayer'));
    }
    if (!isLayerVisible) {
      hiddenLayers.push(t('hiddenLayers.brightfieldLayer'));
    }
    if (!isPolygonLayerVisible) {
      hiddenLayers.push(t('hiddenLayers.polygonLayer'));
    }
    return hiddenLayers;
  };

  const hiddenLayers = getHiddenLayers();
  const hasHiddenLayers = hiddenLayers.length > 0;

  return { hiddenLayers, hasHiddenLayers };
};
