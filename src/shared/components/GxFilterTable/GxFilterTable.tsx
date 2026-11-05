import { Box, FormControlLabel, SxProps, Theme, alpha, useTheme } from '@mui/material';
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
      backgroundColor: theme.palette.background.paper,
      cursor: 'pointer',
      '&.Mui-selected': {
        backgroundColor: alpha(theme.palette.gx.accent.greenBlue, 0.4)
      }
    },
    '& .MuiDataGrid-container--top [role=row]': {
      background: `${theme.palette.background.paper} !important`
    },
    '& .MuiDataGrid-columnHeaderTitle': {
      color: theme.palette.text.secondary,
      textTransform: 'uppercase',
      fontWeight: 700
    },
    '& .MuiDataGrid-footerContainer': {
      background: theme.palette.background.paper
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
  }
});
