import { useShallow } from "zustand/react/shallow";
import { useCellMasksLayerStore } from "../../../../../stores/CellMasksLayerStore/CellMasksLayerStore";
import { useCellsFilterTableColumns } from "./useCellsFilterTableColumns";
import { CellsFilterTableRowEntry } from "./CellsFilterTable.types";
import { GxFilterTable } from "../../../../../shared/components/GxFilterTable";

export const CellsFilterTable = () => {
  const columns = useCellsFilterTableColumns();
  const [setCellNameFilter, clearCellNameFilter, cellNameFilters, colorMapConfig] =
    useCellMasksLayerStore(
      useShallow((store) => [
        store.setCellNameFilter,
        store.clearCellNameFilter,
        store.cellNameFilters,
        store.cellColormapConfig,
      ])
    );

  const rowData: CellsFilterTableRowEntry[] = colorMapConfig.map((item) => ({
    id: item.cellName,
    ...item,
  }));

  return <GxFilterTable<CellsFilterTableRowEntry>
      columns={columns}
      rows={rowData}
      activeFilters={cellNameFilters}
      onClearFilteres={clearCellNameFilter}
      onSetFilter={(filters) => setCellNameFilter(filters)}
    />
};
