import { Box, Button, FormControlLabel, SxProps, Theme, alpha, useTheme } from '@mui/material';
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
  onSetFilter,
  onApplyClick,
  clearDisabled,
  applyDisabled
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
        <Box sx={sx.buttonsWrapper}>
          <Button
            disabled={clearDisabled}
            sx={sx.clearButton}
            onClick={onClearFilteres}
          >
            {t('general.clear')}
          </Button>
          <Button
            disabled={applyDisabled}
            sx={sx.applyButton}
            onClick={onApplyClick}
          >
            {t('general.apply')}
          </Button>
        </Box>
      </Box>
    </>
  );
};

const styles = (theme: Theme): Record<string, SxProps> => ({
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
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'end',
    alignItems: 'end',

    '& .MuiDataGrid-root': {
      borderWidth: '0px',
      width: '100%',
      maxHeight: '480px',
      minHeight: '480px'
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
    marginRight: 0
  },
  buttonsWrapper: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    width: '100%'
  },
  clearButton: {
    width: '100%',
    color: theme.palette.gx.accent.greenBlue,
    border: '2px solid',
    borderColor: theme.palette.gx.accent.greenBlue,
    '&.Mui-disabled': {
      borderColor: theme.palette.gx.mediumGrey[100]
    }
  },
  applyButton: {
    width: '100%',
    background: theme.palette.gx.gradients.brand(),
    color: theme.palette.gx.primary.white,
    fontWeight: 500,
    '&.Mui-disabled': {
      background: theme.palette.gx.mediumGrey[100]
    }
  }
});
