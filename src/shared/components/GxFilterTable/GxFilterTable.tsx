import { SettingsTooltip } from '../SettingsHelp';
import { Box, FormControlLabel, SxProps, Theme, alpha, useTheme } from '@mui/material';
import {
  DataGrid,
  GridPagination,
  GridSlotProps,
  gridPageCountSelector,
  useGridApiContext,
  useGridSelector
} from '@mui/x-data-grid';
import { GridToolbar } from '@mui/x-data-grid/internals';
import { useMemo, useState } from 'react';
import { GxFilterTableProps, GxFilterTableRowPropBase } from './GxFilterTable.types';
import { GxCheckbox } from '../GxCheckbox';
import { useTranslation } from 'react-i18next';

function GridTooltip(props: GridSlotProps['baseTooltip']) {
  return <SettingsTooltip {...props} />;
}

function GridCheckbox({ slotProps, ...rest }: GridSlotProps['baseCheckbox']) {
  return (
    <GxCheckbox
      {...rest}
      slotProps={{ input: slotProps?.htmlInput }}
    />
  );
}

function FilterTableToolbar(props: GridSlotProps['toolbar']) {
  const apiRef = useGridApiContext();
  const pageCount = useGridSelector(apiRef, gridPageCountSelector);

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', borderBottom: 1, borderColor: 'divider', minWidth: 0 }}>
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          '& .MuiTablePagination-toolbar': { minHeight: '36px', paddingLeft: '16px', paddingRight: 0 },
          '& .MuiTablePagination-spacer': { display: 'none' },
          '& .MuiTablePagination-displayedRows': { margin: 0, fontSize: '0.875rem' },
          '& .MuiTablePagination-actions': { display: pageCount > 1 ? 'flex' : 'none', marginLeft: '4px' }
        }}
      >
        <GridPagination />
      </Box>
      <GridToolbar
        {...props}
        csvOptions={{ ...props.csvOptions, disableToolbarButton: true }}
        printOptions={{ ...props.printOptions, disableToolbarButton: true }}
        sx={{ flex: '0 1 auto', minWidth: 0, borderBottom: 0 }}
      />
    </Box>
  );
}

export const GxFilterTable = <T extends GxFilterTableRowPropBase>({
  columns,
  rows,
  activeFilters,
  onSetFilter
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
        <Box sx={sx.gridWrapper}>
          <SettingsTooltip title={t('settingsHelp.controls.filterTable')}>
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
                onSetFilter(new Set(newSelection.ids as Set<string>));
              }}
              disableRowSelectionExcludeModel
              keepNonExistentRowsSelected
              checkboxSelection
              slots={{
                baseCheckbox: GridCheckbox,
                baseTooltip: GridTooltip,
                toolbar: FilterTableToolbar
              }}
              slotProps={{
                toolbar: {
                  showQuickFilter: true
                }
              }}
              hideFooter
              sx={sx.filtersTable}
            />
          </SettingsTooltip>
        </Box>
        <SettingsTooltip title={t('settingsHelp.controls.activeOnly')}>
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
        </SettingsTooltip>
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
      width: '100%'
    },
    '& .MuiDataGrid-virtualScroller': {
      borderRadius: '0px !important'
    },
    '& .MuiDataGrid-row': {
      backgroundColor: theme.palette.settingsPanel.background1,
      cursor: 'pointer',
      '&.Mui-selected': {
        backgroundColor: alpha(theme.palette.primary.main, 0.2)
      }
    },
    '& .MuiDataGrid-container--top [role=row]': {
      background: `${theme.palette.settingsPanel.background1} !important`
    },
    '& .MuiDataGrid-columnHeaderTitle': {
      color: theme.palette.settingsPanel.secondaryText,
      textTransform: 'none',
      fontWeight: 700
    },
    '& .MuiDataGrid-footerContainer': {
      background: theme.palette.settingsPanel.background1
    }
  },
  gridWrapper: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    maxHeight: '480px'
  },
  filtersTable: {
    '& .MuiDataGrid-cellCheckbox:focus, & .MuiDataGrid-cellCheckbox:focus-within, & .MuiDataGrid-columnHeaderCheckbox:focus, & .MuiDataGrid-columnHeaderCheckbox:focus-within':
      {
        outline: 'none'
      },
    '& .MuiDataGrid-cell': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  },
  activeFiltersSwitchWrapper: {
    alignSelf: 'flex-start',
    marginTop: '18px',
    marginLeft: 0,
    marginRight: 0
  }
});
