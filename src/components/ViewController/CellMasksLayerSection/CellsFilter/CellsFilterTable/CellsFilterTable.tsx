import { useShallow } from 'zustand/react/shallow';
import { useCellSegmentationLayerStore } from '../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useCellsFilterTableColumns } from './useCellsFilterTableColumns';
import { CellsFilterTableRowEntry } from './CellsFilterTable.types';
import { GxFilterTable } from '../../../../../shared/components/GxFilterTable';

export const CellsFilterTable = () => {
  const columns = useCellsFilterTableColumns();
  const [setCellNameFilter, cellNameFilters, colorMapConfig] = useCellSegmentationLayerStore(
    useShallow((store) => [store.setCellNameFilter, store.cellNameFilters, store.cellColormapConfig])
  );

  const rowData: CellsFilterTableRowEntry[] = colorMapConfig
    ? colorMapConfig.map((item) => ({
        id: item.clusterId,
        ...item
      }))
    : [];

  return (
    <GxFilterTable<CellsFilterTableRowEntry>
      columns={columns}
      rows={rowData}
      activeFilters={cellNameFilters}
      onSetFilter={setCellNameFilter}
    />
  );
};
