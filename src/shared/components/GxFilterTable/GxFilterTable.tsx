import { Box, FormControlLabel, Theme, alpha, useTheme } from '@mui/material';
import { GridToolbarQuickFilter } from '@mui/x-data-grid';
import { DataGrid } from '@mui/x-data-grid';
import { useMemo, useState } from 'react';
import { GxFilterTableProps, GxFilterTableRowPropBase } from './GxFilterTable.types';
import { GxCheckbox } from '../GxCheckbox';
import { useTranslation } from 'react-i18next';

const GxFiltersSearch = () => {
  const theme = useTheme();
  const sx = styles(theme);

  return (
    <GridToolbarQuickFilter
      quickFilterParser={(searchInput: string) =>
        searchInput
          .split(',')
          .map((value) => value.trim())
          .filter((value) => value !== '')
      }
      sx={sx.searchToolbar}
    />
  );
};

export const GxFilterTable = <T extends GxFilterTableRowPropBase>({
  columns,
  rows,
  activeFilters,
  onClearFilteres,
  onSetFilter
}: GxFilterTableProps<T>) => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();
  const [activeOnly, setActiveOnly] = useState<boolean>(false);

  rows = useMemo(
    () => (activeOnly ? rows.filter((item) => activeFilters.includes(item.id)) : rows),
    [activeOnly, activeFilters, rows]
  );

  return (
    <>
      <Box sx={sx.tableContainer}>
        <DataGrid
          rows={rows}
          columns={columns}
          density="compact"
          disableColumnMenu
          disableColumnResize
          disableColumnSorting
          pageSizeOptions={[100]}
          rowSelectionModel={activeFilters}
          onRowSelectionModelChange={(newSelection) => {
            if (newSelection.length === 0 || newSelection.length === rows.length) {
              onClearFilteres();
            } else {
              onSetFilter(newSelection as string[]);
            }
          }}
          keepNonExistentRowsSelected
          checkboxSelection
          slots={{
            baseCheckbox: GxCheckbox,
            toolbar: GxFiltersSearch
          }}
          slotProps={{
            toolbar: {
              showQuickFilter: true
            }
          }}
          hideFooterSelectedRowCount={true}
          sx={sx.filtersTable}
        />
      </Box>
      <FormControlLabel
        label={t('general.filterShowActiveOnly')}
        labelPlacement="end"
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
  searchToolbar: {
    marginBottom: '8px',
    '& .MuiInputBase-root': {
      backgroundColor: theme.palette.gx.primary.white,
      padding: '8px',
      '&:hover:not(.Mui-disabled, .Mui-error):before': {
        borderColor: theme.palette.gx.mediumGrey[300]
      },
      '&:after': {
        borderColor: theme.palette.gx.accent.greenBlue
      }
    }
  },
  tableContainer: {
    '& .MuiDataGrid-root': {
      borderWidth: '0px'
    },
    '& .MuiDataGrid-virtualScroller': {
      borderRadius: '0px !important'
    },
    '& .MuiDataGrid-row': {
      backgroundColor: theme.palette.gx.primary.white,
      cursor: 'pointer',
      '&.Mui-selected': {
        backgroundColor: alpha(theme.palette.gx.accent.greenBlue, 0.4)
      }
    },
    '& .MuiDataGrid-container--top [role=row]': {
      background: `${theme.palette.gx.lightGrey[900]} !important`
    },
    '& .MuiDataGrid-columnHeaderTitle': {
      color: theme.palette.gx.darkGrey[900],
      textTransform: 'uppercase',
      fontWeight: 700
    },
    '& .MuiDataGrid-footerContainer': {
      background: theme.palette.gx.lightGrey[900]
    }
  },
  filtersTable: {
    height: '400px',
    '& .MuiDataGrid-cell': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  },
  activeFiltersSwitchWrapper: {
    float: 'right'
  }
});
