import { DataGrid } from "@mui/x-data-grid";
import { usePointFiltersTableColumns } from "./usePointFiltersTableColumns";
import {
  Box,
  FormControlLabel,
  Theme,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import ErrorIcon from "@mui/icons-material/Error";
import { useMetadataLayerStore } from "../../../../../stores/MetadataLayerStore";
import { useShallow } from "zustand/react/shallow";
import { GxCheckbox } from "../../../../../shared/components/GxCheckbox";
import { PointFiltersSearch } from "../PointFiltersSearch";
import { PointFiltersTableRowEntry } from "./PointFiltersTable.types";
import { useBinaryFilesStore } from "../../../../../stores/BinaryFilesStore";
import { useState } from "react";

export const PointFiltersTable = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const [activeOnly, setActiveOnly] = useState<boolean>(false);

  const columns = usePointFiltersTableColumns();
  const [setGeneNamesFilter, clearGeneNameFilters, geneNameFilters] =
    useMetadataLayerStore(
      useShallow((store) => [
        store.setGeneNamesFilter,
        store.clearGeneNameFilters,
        store.geneNameFilters,
      ])
    );

  const colorMapConfig = useBinaryFilesStore((store) => store.colorMapConfig);

  let rowData: PointFiltersTableRowEntry[] = colorMapConfig
    ? colorMapConfig.map((item) => ({
        id: item.gene_name,
        visible: true,
        ...item,
      }))
    : [];

  if (activeOnly) {
    rowData = rowData.filter((item) =>
      geneNameFilters.includes(item.gene_name)
    );
  }

  return (
    <>
      <Box sx={sx.tableContainer}>
        {!colorMapConfig && (
          <Box sx={sx.errorContainer}>
            <ErrorIcon sx={sx.errorIcon}/>
            <Typography sx={sx.errorText}>Missing colormap config data.</Typography>
          </Box>
        )}
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
      <FormControlLabel
        label="Show active filters only"
        labelPlacement="start"
        sx={sx.activeFiltersSwitchWrapper}
        control={
          <GxCheckbox
            onChange={() => setActiveOnly((prev) => !prev)}
            checked={activeOnly}
            disableTouchRipple
          />
        }
      />
    </>
  );
};

const styles = (theme: Theme) => ({
  tableContainer: {
    "& .MuiDataGrid-root": {
      borderWidth: "0px",
    },
    "& .MuiDataGrid-virtualScroller": {
      borderRadius: "0px !important",
    },
    "& .MuiDataGrid-row": {
      backgroundColor: theme.palette.gx.primary.white,
      cursor: "pointer",
      "&.Mui-selected": {
        backgroundColor: alpha(theme.palette.gx.accent.greenBlue, 0.4),
      },
    },
    "& .MuiDataGrid-container--top [role=row]": {
      background: `${theme.palette.gx.lightGrey[900]} !important`,
    },
    "& .MuiDataGrid-columnHeaderTitle": {
      color: theme.palette.gx.darkGrey[900],
      textTransform: "uppercase",
      fontWeight: 700,
    },
    "& .MuiDataGrid-footerContainer": {
      background: theme.palette.gx.lightGrey[900],
    },
  },
  filtersTable: {
    height: "400px",
    "& .MuiDataGrid-cell": {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
  },
  activeFiltersSwitchWrapper: {
    float: "right",
  },
  errorContainer: {
    display: 'flex',
    marginBottom: '8px',
  },
  errorIcon: {
    color: theme.palette.gx.accent.error,
    marginRight: '8px',
  },
  errorText: {
    color: theme.palette.gx.accent.error,
    fontWeight: 700,
  }
});
