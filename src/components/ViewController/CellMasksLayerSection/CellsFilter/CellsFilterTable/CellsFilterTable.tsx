import { useShallow } from 'zustand/react/shallow';
import { useCellSegmentationLayerStore } from '../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { CellNameFilterType } from '../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore.types';
import { useCellsFilterTableColumns } from './useCellsFilterTableColumns';
import { CellsFilterTableRowEntry } from './CellsFilterTable.types';
import { GxFilterTable } from '../../../../../shared/components/GxFilterTable';
import { useEffect, useState } from 'react';
import { isEqual } from 'lodash';

export const CellsFilterTable = () => {
  const columns = useCellsFilterTableColumns();
  const [activeFilters, setActiveFilters] = useState<CellNameFilterType>(new Set<string>());
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
    setActiveFilters(new Set<string>());
    clearCellNameFilter();
  };

  const handleApplyClick = () => {
    setCellNameFilter(activeFilters);
    if (!isCellNameFilterOn && activeFilters.size > 0) {
      useCellSegmentationLayerStore.getState().toggleCellNameFilter();
    }
  };

  const haveFiltersChanges =
    activeFilters.size !== cellNameFilters.size ||
    !isEqual(Array.from(activeFilters).sort(), Array.from(cellNameFilters).sort());

  return (
    <GxFilterTable<CellsFilterTableRowEntry>
      columns={columns}
      rows={rowData}
      activeFilters={activeFilters}
      onClearFilters={handleClearFilters}
      onApplyClick={handleApplyClick}
      onSetFilter={(filters) => setActiveFilters(filters)}
      clearDisabled={!isCellNameFilterOn || activeFilters.size === 0}
      applyDisabled={!haveFiltersChanges || activeFilters.size === 0}
    />
  );
};
