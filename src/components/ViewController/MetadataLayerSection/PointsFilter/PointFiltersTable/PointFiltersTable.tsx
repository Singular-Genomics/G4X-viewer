import { usePointFiltersTableColumns } from "./usePointFiltersTableColumns";
import { useMetadataLayerStore } from "../../../../../stores/MetadataLayerStore";
import { useShallow } from "zustand/react/shallow";
import { PointFiltersTableRowEntry } from "./PointFiltersTable.types";
import { useBinaryFilesStore } from "../../../../../stores/BinaryFilesStore";
import { GxFilterTable } from "../../../../../shared/components/GxFilterTable";

export const PointFiltersTable = () => {
  const columns = usePointFiltersTableColumns();
  const [setGeneNamesFilter, clearGeneNameFilters, geneNameFilters] =
    useMetadataLayerStore(
      useShallow((store) => [
        store.setGeneNamesFilter,
        store.clearGeneNameFilters,
        store.geneNameFilters,
      ])
    );

  const rowData: PointFiltersTableRowEntry[] = useBinaryFilesStore
    .getState()
    .colorMapConfig.map((item) => ({
      id: item.gene_name,
      ...item,
    }));

  return <GxFilterTable<PointFiltersTableRowEntry> 
    columns={columns}
    rows={rowData}
    activeFilters={geneNameFilters}
    onClearFilteres={clearGeneNameFilters}
    onSetFilter={(filters) => setGeneNamesFilter(filters)}
  />;
};
