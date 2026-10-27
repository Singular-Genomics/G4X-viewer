import { usePointFiltersTableColumns } from './usePointFiltersTableColumns';
import { GeneNameFilterType } from '../../../../../stores/TranscriptLayerStore';
import { useShallow } from 'zustand/react/shallow';
import { PointFiltersTableRowEntry } from './PointFiltersTable.types';
import { useTranscriptSource } from '../../TranscriptSourceContext';
import { GxFilterTable } from '../../../../../shared/components/GxFilterTable';
import { useEffect, useState } from 'react';
import { isEqual } from 'lodash';

export const PointFiltersTable = () => {
  const { useLayerStore, useColorMap } = useTranscriptSource();
  const columns = usePointFiltersTableColumns();
  const [activeFilters, setActiveFilters] = useState<GeneNameFilterType>(new Set());
  const [setGeneNamesFilter, clearGeneNameFilters, geneNameFilters, isGeneNameFilterActive] = useLayerStore(
    useShallow((store) => [
      store.setGeneNamesFilter,
      store.clearGeneNameFilters,
      store.geneNameFilters,
      store.isGeneNameFilterActive
    ])
  );

  useEffect(() => {
    setActiveFilters(new Set(geneNameFilters));
  }, [geneNameFilters]);

  const { colorMapConfig } = useColorMap();

  const rowData: PointFiltersTableRowEntry[] = colorMapConfig
    ? colorMapConfig.map((item) => ({
        id: item.gene_name,
        visible: true,
        ...item
      }))
    : [];

  const handleClearFilters = () => {
    setActiveFilters(new Set<string>());
    clearGeneNameFilters();
  };

  const handleApplyClick = () => {
    setGeneNamesFilter(activeFilters);
    if (!isGeneNameFilterActive && activeFilters.size > 0) {
      useLayerStore.getState().toggleGeneNameFilter();
    }
  };

  const haveFiltersChanges =
    activeFilters.size !== geneNameFilters.size ||
    !isEqual(Array.from(activeFilters).sort(), Array.from(geneNameFilters).sort());

  return (
    <GxFilterTable<PointFiltersTableRowEntry>
      columns={columns}
      rows={rowData}
      activeFilters={activeFilters}
      onClearFilters={handleClearFilters}
      onApplyClick={handleApplyClick}
      onSetFilter={(filters) => setActiveFilters(filters)}
      clearDisabled={!isGeneNameFilterActive || activeFilters.size === 0}
      applyDisabled={!haveFiltersChanges || activeFilters.size === 0}
    />
  );
};
