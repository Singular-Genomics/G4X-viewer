import { Box, Button, FormControlLabel, SxProps, Theme, alpha, useTheme } from '@mui/material';
import { DataGrid, GridSlotProps } from '@mui/x-data-grid';
import { useMemo, useState } from 'react';
import { GxFilterTableProps, GxFilterTableRowPropBase } from './GxFilterTable.types';
import { GxCheckbox } from '../GxCheckbox';
import { useTranslation } from 'react-i18next';

function GridCheckbox({ slotProps, ...rest }: GridSlotProps['baseCheckbox']) {
  return (
    <GxCheckbox
      {...rest}
      slotProps={{ input: slotProps?.htmlInput }}
    />
  );
}

export const GxFilterTable = <T extends GxFilterTableRowPropBase>({
  columns,
  rows,
  activeFilters,
  onClearFilters,
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
    () => (activeOnly ? rows.filter((item) => activeFilters.has(item.id)) : rows),
    [activeOnly, activeFilters, rows]
  );

  return (
    <>
      <Box sx={sx.tableContainer}>
        <Box sx={sx.buttonsWrapper}>
          <Button
            disabled={clearDisabled}
            sx={sx.clearButton}
            onClick={onClearFilters}
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
        <DataGrid
          rows={rows}
          columns={columns}
          density="compact"
          disableColumnMenu
          disableColumnResize
          pageSizeOptions={[100]}
          showToolbar
          disableColumnSelector
          rowSelectionModel={{ ids: activeFilters, type: 'include' }}
          onRowSelectionModelChange={(newSelection) => {
            if (newSelection.ids.size === 0 || newSelection.ids.size === rows.length) {
              onClearFilters();
            } else {
              onSetFilter(newSelection.ids as Set<string>);
            }
          }}
          keepNonExistentRowsSelected
          checkboxSelection
          slots={{
            baseCheckbox: GridCheckbox
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
      </Box>
    </>
  );
};

const styles = (theme: Theme): Record<string, SxProps> => ({
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
    },
    '& .MuiDataGrid-columnHeaderTitleContainerContent .MuiCheckbox-root': {
      color: theme.palette.gx.accent.greenBlue
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
    width: '100%',
    marginBottom: '8px'
  },
  clearButton: {
    width: '100%',
    color: theme.palette.gx.accent.greenBlue,
    border: '2px solid',
    borderColor: theme.palette.gx.accent.greenBlue,
    '&.Mui-disabled': {
      borderColor: theme.palette.gx.mediumGrey[300],
      color: theme.palette.gx.mediumGrey[300]
    }
  },
  applyButton: {
    width: '100%',
    background: theme.palette.gx.gradients.brand(),
    color: theme.palette.gx.primary.white,
    fontWeight: 500,
    '&.Mui-disabled': {
      background: theme.palette.gx.mediumGrey[300]
    }
  }
});
