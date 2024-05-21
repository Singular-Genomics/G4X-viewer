import { DataGrid } from "@mui/x-data-grid";
import { usePointFiltersTableColumns } from "./usePointFiltersTableColumns";
import { Box } from "@mui/material";
import { useMetadataLayerStore } from "../../../../../stores/MetadataLayerStore";
import { useShallow } from "zustand/react/shallow";
import { GxCheckbox } from "../../../../../shared/components/GxCheckbox";
import { PointFiltersSearch } from "../PointFiltersSearch";
import { PointFiltersTableRowEntry } from "./PointFiltersTable.types";
import { useBinaryFilesStore } from "../../../../../stores/BinaryFilesStore";

export const PointFiltersTable = () => {
  const rowData: PointFiltersTableRowEntry[] = useBinaryFilesStore
    .getState()
    .colorMapConfig.map((item) => ({
      id: item.gene_name,
      visible: true,
      ...item,
    }));

  const columns = usePointFiltersTableColumns();
  const [setGeneNamesFilter, clearGeneNameFilters] = useMetadataLayerStore(
    useShallow((store) => [
      store.setGeneNamesFilter,
      store.clearGeneNameFilters,
    ])
  );

  return (
    <Box sx={sx.tableContainer}>
      <DataGrid
        rows={rowData ?? []}
        columns={columns}
        density="compact"
        disableColumnMenu
        disableColumnResize
        disableColumnSorting
        pageSizeOptions={[]}
        onRowSelectionModelChange={(newSelection) => {
          if (
            newSelection.length === 0 ||
            newSelection.length === rowData.length
          ) {
            clearGeneNameFilters();
          }

          setGeneNamesFilter(newSelection as string[]);
        }}
        checkboxSelection
        slots={{
          baseCheckbox: GxCheckbox,
          toolbar: PointFiltersSearch,
        }}
        slotProps={{
          toolbar: {
            showQuickFilter: true,
          },
        }}
        hideFooterSelectedRowCount={true}
        sx={sx.filtersTable}
      />
    </Box>
  );
};

const sx = {
  tableContainer: {
    maxHeight: "400px",
    "& .MuiDataGrid-root": {
      borderWidth: '0px',
    },
    '& .MuiDataGrid-virtualScroller': {
      borderRadius: '0px !important',
    },
    "& .MuiDataGrid-row": {
      backgroundColor: "#FFF",
      cursor: "pointer",
      "&.Mui-selected": {
        backgroundColor: "rgba(0, 177, 164, 0.4)",
      },
    },
    '& .MuiDataGrid-container--top [role=row]': {
      background: '#EEE !important',
    },
    "& .MuiDataGrid-columnHeaderTitle": {
      color: "#626668",
      textTransform: "uppercase",
      fontWeight: 700,
    },
    "& .MuiDataGrid-footerContainer": {
      background: '#EEE',
    }
  },
  filtersTable: {
    height: "400px",
    "& .MuiDataGrid-cell": {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  },
};
