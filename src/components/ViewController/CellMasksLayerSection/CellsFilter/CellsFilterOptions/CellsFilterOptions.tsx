import { useShallow } from "zustand/react/shallow";
import { useCellMasksLayerStore } from "../../../../../stores/CellMasksLayerStore/CellMasksLayerStore";
import { GxFilterTableOptions } from "../../../../../shared/components/GxFilterTable/GxFilterTableOptions";

export const CellsFilterOptions = () => {
  const [
    isCellNameFilterOn,
    showFilteredCells,
    toggleCellNameFilter,
    toggleShowFilteredCells,
  ] = useCellMasksLayerStore(
    useShallow((store) => [
      store.isCellNameFilterOn,
      store.showFilteredCells,
      store.toggleCellNameFilter,
      store.toggleShowFilteredCells,
    ])
  );

  return (
    <GxFilterTableOptions
      isFilterEnabled={isCellNameFilterOn}
      isShowDiscardedEnabled={showFilteredCells}
      onToggleFilter={toggleCellNameFilter}
      onToggleShowDiscarded={toggleShowFilteredCells}
    />
  )
};
