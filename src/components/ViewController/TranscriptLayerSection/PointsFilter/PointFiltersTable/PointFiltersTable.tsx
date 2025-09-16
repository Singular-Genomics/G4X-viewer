import { usePointFiltersTableColumns } from './usePointFiltersTableColumns';
import { useTranscriptLayerStore } from '../../../../../stores/TranscriptLayerStore';
import { useShallow } from 'zustand/react/shallow';
import { PointFiltersTableRowEntry } from './PointFiltersTable.types';
import { useBinaryFilesStore } from '../../../../../stores/BinaryFilesStore';
import { GxFilterTable } from '../../../../../shared/components/GxFilterTable';
import { useEffect, useState } from 'react';
import _ from 'lodash';

export const PointFiltersTable = () => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const columns = usePointFiltersTableColumns();
  const [setGeneNamesFilter, clearGeneNameFilters, geneNameFilters, isGeneNameFilterActive] = useTranscriptLayerStore(
    useShallow((store) => [
      store.setGeneNamesFilter,
      store.clearGeneNameFilters,
      store.geneNameFilters,
      store.isGeneNameFilterActive
    ])
  );

  useEffect(() => {
    setActiveFilters(useTranscriptLayerStore.getState().geneNameFilters);
  }, []);

  const colorMapConfig = useBinaryFilesStore((store) => store.colorMapConfig);

  const rowData: PointFiltersTableRowEntry[] = colorMapConfig
    ? colorMapConfig.map((item) => ({
        id: item.gene_name,
        visible: true,
        ...item
      }))
    : [];

  const handleClearFilters = () => {
    setActiveFilters([]);
    clearGeneNameFilters();
  };

  const handleApplyClick = () => {
    setGeneNamesFilter(activeFilters);
  };

  const haveFiltersChanges =
    activeFilters.length !== geneNameFilters.length || !_.isEqual(activeFilters.sort(), geneNameFilters.sort());

  return (
    <GxFilterTable<PointFiltersTableRowEntry>
      columns={columns}
      rows={rowData}
      activeFilters={activeFilters}
      onClearFilteres={handleClearFilters}
      onApplyClick={handleApplyClick}
      onSetFilter={(filters) => setActiveFilters(filters)}
      clearDisabled={!isGeneNameFilterActive || activeFilters.length === 0}
      applyDisabled={!isGeneNameFilterActive || activeFilters.length === 0 || !haveFiltersChanges}
    />
  );
};
