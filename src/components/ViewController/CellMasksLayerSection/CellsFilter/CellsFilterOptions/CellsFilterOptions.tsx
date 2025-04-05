import { useShallow } from 'zustand/react/shallow';
import { useCellSegmentationLayerStore } from '../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { GxFilterTableOptions } from '../../../../../shared/components/GxFilterTable/GxFilterTableOptions';

export const CellsFilterOptions = () => {
  const [isCellNameFilterOn, showFilteredCells, toggleCellNameFilter, toggleShowFilteredCells] =
    useCellSegmentationLayerStore(
      useShallow((store) => [
        store.isCellNameFilterOn,
        store.showFilteredCells,
        store.toggleCellNameFilter,
        store.toggleShowFilteredCells
      ])
    );

  return (
    <GxFilterTableOptions
      isFilterEnabled={isCellNameFilterOn}
      isShowDiscardedEnabled={showFilteredCells}
      onToggleFilter={toggleCellNameFilter}
      onToggleShowDiscarded={toggleShowFilteredCells}
    />
  );
};
