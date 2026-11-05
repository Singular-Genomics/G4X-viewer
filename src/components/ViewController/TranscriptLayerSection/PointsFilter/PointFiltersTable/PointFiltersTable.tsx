import { usePointFiltersTableColumns } from './usePointFiltersTableColumns';
import { useTranscriptLayerStore } from '../../../../../stores/TranscriptLayerStore';
import { useShallow } from 'zustand/react/shallow';
import { PointFiltersTableRowEntry } from './PointFiltersTable.types';
import { useZarrDataStore } from '../../../../../stores/ZarrDataStore';
import { GxFilterTable } from '../../../../../shared/components/GxFilterTable';

export const PointFiltersTable = () => {
  const columns = usePointFiltersTableColumns();
  const [setGeneNamesFilter, geneNameFilters] = useTranscriptLayerStore(
    useShallow((store) => [store.setGeneNamesFilter, store.geneNameFilters])
  );

  const colorMapConfig = useZarrDataStore((store) => store.colorMapConfig);

  const rowData: PointFiltersTableRowEntry[] = colorMapConfig
    ? colorMapConfig.map((item) => ({
        id: item.gene_name,
        visible: true,
        ...item
      }))
    : [];

  return (
    <GxFilterTable<PointFiltersTableRowEntry>
      columns={columns}
      rows={rowData}
      activeFilters={geneNameFilters}
      onSetFilter={setGeneNamesFilter}
    />
  );
};
