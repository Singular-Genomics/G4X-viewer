import {
  Box,
  Button,
  FormControlLabel,
  IconButton,
  Portal,
  SxProps,
  Theme,
  Tooltip,
  alpha,
  useTheme
} from '@mui/material';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import {
  DataGrid,
  GridFilterModel,
  GridInitialState,
  GridPaginationModel,
  GridSlotProps,
  GridSortModel,
  useGridApiRef
} from '@mui/x-data-grid';
import { useMemo, useState } from 'react';
import { GxFilterTableProps, GxFilterTableRowPropBase } from './GxFilterTable.types';
import { GxCheckbox } from '../GxCheckbox';
import { GxWindow, GxWindowProps } from '../GxWindow';
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
  applyDisabled,
  disableColumnResize = true,
  floatingWindowTitle
}: GxFilterTableProps<T>) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const [activeOnly, setActiveOnly] = useState<boolean>(false);
  const [isWindowOpen, setIsWindowOpen] = useState(false);
  const [windowConfig, setWindowConfig] = useState<GxWindowProps['config']>();
  const [floatingGridState, setFloatingGridState] = useState<GridInitialState>();
  const [filterModel, setFilterModel] = useState<GridFilterModel>({ items: [] });
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 100 });
  const floatingApiRef = useGridApiRef();

  const handleWindowToggle = (open: boolean) => {
    if (open) {
      const maxWidth = Math.max(1, window.innerWidth - 48);
      const maxHeight = Math.max(1, window.innerHeight - 180);
      setWindowConfig({
        startWidth: Math.min(850, maxWidth),
        startHeight: Math.min(500, maxHeight),
        minWidth: Math.min(400, maxWidth),
        minHeight: Math.min(300, maxHeight),
        maxWidth,
        maxHeight,
        startX: 24,
        startY: 100
      });
    } else {
      // Preserve the floating grid's column widths when its window is reopened.
      setFloatingGridState(floatingApiRef.current?.exportState());
    }
    setIsWindowOpen(open);
  };

  rows = useMemo(
    () => (activeOnly ? rows.filter((item) => activeFilters.has(item.id)) : rows),
    [activeOnly, activeFilters, rows]
  );

  const renderTable = (isFloating: boolean) => {
    const sx = styles(theme, isFloating);
    const actions = (
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
        {floatingWindowTitle && !isFloating && (
          <Tooltip title={t('general.openTableInWindow')}>
            <span>
              <IconButton
                aria-label={t('general.openTableInWindow')}
                onClick={() => handleWindowToggle(true)}
                disabled={isWindowOpen}
                sx={sx.openWindowButton}
              >
                <OpenInFullIcon />
              </IconButton>
            </span>
          </Tooltip>
        )}
      </Box>
    );
    const activeOnlyToggle = (
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
    );

    return (
      <Box sx={sx.tableContainer}>
        {!isFloating && actions}
        <DataGrid
          apiRef={isFloating ? floatingApiRef : undefined}
          initialState={isFloating ? floatingGridState : undefined}
          filterModel={filterModel}
          onFilterModelChange={setFilterModel}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          rows={rows}
          columns={columns}
          density="compact"
          disableColumnMenu
          disableColumnResize={disableColumnResize}
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
        {isFloating ? (
          <Box sx={sx.floatingFooter}>
            {actions}
            {activeOnlyToggle}
          </Box>
        ) : (
          activeOnlyToggle
        )}
      </Box>
    );
  };

  return (
    <>
      {renderTable(false)}
      {isWindowOpen && (
        <Portal>
          <GxWindow
            title={floatingWindowTitle}
            config={windowConfig}
            onClose={() => handleWindowToggle(false)}
          >
            {renderTable(true)}
          </GxWindow>
        </Portal>
      )}
    </>
  );
};

const styles = (theme: Theme, isFloating: boolean): Record<string, SxProps> => ({
  tableContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'end',
    alignItems: 'end',
    height: isFloating ? '100%' : undefined,
    '& .MuiDataGrid-root': {
      borderWidth: '0px',
      width: '100%',
      maxHeight: isFloating ? 'none' : '480px',
      minHeight: isFloating ? 0 : '480px'
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
    height: isFloating ? 0 : '400px',
    flex: isFloating ? 1 : undefined,
    '& .MuiDataGrid-cell': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  },
  activeFiltersSwitchWrapper: {
    marginRight: 0,
    ...(isFloating && { marginLeft: 0 })
  },
  floatingFooter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    flexShrink: 0,
    gap: '12px',
    width: '100%',
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid',
    borderColor: theme.palette.gx.mediumGrey[700]
  },
  buttonsWrapper: {
    display: 'flex',
    justifyContent: isFloating ? 'flex-start' : 'center',
    gap: '8px',
    width: isFloating ? 'auto' : '100%',
    flexShrink: 0,
    marginBottom: isFloating ? 0 : '8px'
  },
  openWindowButton: {
    color: theme.palette.gx.accent.greenBlue,
    flexShrink: 0
  },
  clearButton: {
    width: isFloating ? 'auto' : '100%',
    minWidth: isFloating ? '112px' : undefined,
    color: theme.palette.gx.accent.greenBlue,
    border: '2px solid',
    borderColor: theme.palette.gx.accent.greenBlue,
    '&.Mui-disabled': {
      borderColor: theme.palette.gx.mediumGrey[300],
      color: theme.palette.gx.mediumGrey[300]
    }
  },
  applyButton: {
    width: isFloating ? 'auto' : '100%',
    minWidth: isFloating ? '112px' : undefined,
    background: theme.palette.gx.gradients.brand(),
    color: theme.palette.gx.primary.white,
    fontWeight: 500,
    '&.Mui-disabled': {
      background: theme.palette.gx.mediumGrey[300]
    }
  }
});
