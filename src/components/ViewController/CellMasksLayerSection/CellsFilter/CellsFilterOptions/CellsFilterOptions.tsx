import { useShallow } from 'zustand/react/shallow';
import { useCellSegmentationLayerStore } from '../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { GxFilterTableOptions } from '../../../../../shared/components/GxFilterTable/GxFilterTableOptions';

export const CellsFilterOptions = () => {
  const [
    isCellNameFilterOn,
    showFilteredCells,
    toggleCellNameFilter,
    toggleShowFilteredCells,
    cellNameFilters,
    clearCellNameFilter
  ] = useCellSegmentationLayerStore(
    useShallow((store) => [
      store.isCellNameFilterOn,
      store.showFilteredCells,
      store.toggleCellNameFilter,
      store.toggleShowFilteredCells,
      store.cellNameFilters,
      store.clearCellNameFilter
    ])
  );

  return (
    <GxFilterTableOptions
      isFilterEnabled={isCellNameFilterOn}
      isShowDiscardedEnabled={showFilteredCells}
      onToggleFilter={toggleCellNameFilter}
      onToggleShowDiscarded={toggleShowFilteredCells}
      onClearFilters={clearCellNameFilter}
      clearDisabled={cellNameFilters.size === 0}
    />
  );
};
