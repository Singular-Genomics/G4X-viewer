import { useShallow } from 'zustand/react/shallow';
import { useCellSegmentationLayerStore } from '../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useCellsFilterTableColumns } from './useCellsFilterTableColumns';
import { CellsFilterTableRowEntry } from './CellsFilterTable.types';
import { GxFilterTable } from '../../../../../shared/components/GxFilterTable';
import { useEffect, useState } from 'react';
import { isEqual } from 'lodash';

export const CellsFilterTable = () => {
  const columns = useCellsFilterTableColumns();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [setCellNameFilter, clearCellNameFilter, cellNameFilters, colorMapConfig, isCellNameFilterOn] =
    useCellSegmentationLayerStore(
      useShallow((store) => [
        store.setCellNameFilter,
        store.clearCellNameFilter,
        store.cellNameFilters,
        store.cellColormapConfig,
        store.isCellNameFilterOn
      ])
    );

  useEffect(() => {
    setActiveFilters(useCellSegmentationLayerStore.getState().cellNameFilters);
  }, []);

  const rowData: CellsFilterTableRowEntry[] = colorMapConfig
    ? colorMapConfig.map((item) => ({
        id: item.clusterId,
        ...item
      }))
    : [];

  const handleClearFilters = () => {
    setActiveFilters([]);
    clearCellNameFilter();
  };

  const handleApplyClick = () => {
    setCellNameFilter(activeFilters);
    if (!isCellNameFilterOn && activeFilters.length > 0) {
      useCellSegmentationLayerStore.getState().toggleCellNameFilter();
    }
  };

  const haveFiltersChanges =
    activeFilters.length !== cellNameFilters.length || !isEqual(activeFilters.sort(), cellNameFilters.sort());

  return (
    <GxFilterTable<CellsFilterTableRowEntry>
      columns={columns}
      rows={rowData}
      activeFilters={activeFilters}
      onClearFilteres={handleClearFilters}
      onApplyClick={handleApplyClick}
      onSetFilter={(filters) => setActiveFilters(filters)}
      clearDisabled={!isCellNameFilterOn || activeFilters.length === 0}
      applyDisabled={activeFilters.length === 0 || !haveFiltersChanges}
    />
  );
};
