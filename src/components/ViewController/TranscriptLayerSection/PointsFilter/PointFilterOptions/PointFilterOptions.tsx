import { useTranscriptLayerStore } from '../../../../../stores/TranscriptLayerStore';
import { useShallow } from 'zustand/react/shallow';
import { GxFilterTableOptions } from '../../../../../shared/components/GxFilterTable/GxFilterTableOptions';

export const PointFilterOptions = () => {
  const [
    isGeneNameFilterActive,
    showFilteredPoints,
    toggleGeneNameFilter,
    toggleShowFilteredPoints,
    geneNameFilters,
    clearGeneNameFilters
  ] = useTranscriptLayerStore(
    useShallow((store) => [
      store.isGeneNameFilterActive,
      store.showFilteredPoints,
      store.toggleGeneNameFilter,
      store.toggleShowFilteredPoints,
      store.geneNameFilters,
      store.clearGeneNameFilters
    ])
  );

  return (
    <GxFilterTableOptions
      isFilterEnabled={isGeneNameFilterActive}
      isShowDiscardedEnabled={showFilteredPoints}
      onToggleFilter={toggleGeneNameFilter}
      onToggleShowDiscarded={toggleShowFilteredPoints}
      onClearFilters={clearGeneNameFilters}
      clearDisabled={geneNameFilters.size === 0}
    />
  );
};
