import { useShallow } from "zustand/react/shallow";
import { useCellSegmentationLayerStore } from "../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore";
import { useCellsFilterTableColumns } from "./useCellsFilterTableColumns";
import { CellsFilterTableRowEntry } from "./CellsFilterTable.types";
import { GxFilterTable } from "../../../../../shared/components/GxFilterTable";

export const CellsFilterTable = () => {
  const columns = useCellsFilterTableColumns();
  const [setCellNameFilter, clearCellNameFilter, cellNameFilters, colorMapConfig] =
    useCellSegmentationLayerStore(
      useShallow((store) => [
        store.setCellNameFilter,
        store.clearCellNameFilter,
        store.cellNameFilters,
        store.cellColormapConfig,
      ])
    );
  
  const rowData: CellsFilterTableRowEntry[] = colorMapConfig.map((item, index) => ({
    id: `${item.cellName}_${index}`,
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
