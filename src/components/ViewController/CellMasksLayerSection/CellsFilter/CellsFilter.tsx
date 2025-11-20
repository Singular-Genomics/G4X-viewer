import { useCellSegmentationLayerStore } from '../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { CellsFilterOptions } from './CellsFilterOptions';
import { CellsFilterTable } from './CellsFilterTable';
import { Box, Theme, Typography, useTheme } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { GxFilterTableColormap } from '../../../../shared/components/GxFilterTable/GxFilterTableColormap/GxFilterTableColormap';

export const CellsFilter = () => {
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const sx = styles(theme);
  const { cellColormapConfig, setCellColormapConfig } = useCellSegmentationLayerStore();

  const isColormapConfigValid = cellColormapConfig && cellColormapConfig.length;

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importData = JSON.parse(content);
        setCellColormapConfig(importData);
        enqueueSnackbar({
          variant: 'gxSnackbar',
          message: t('general.colormapImportSuccess'),
          titleMode: 'success'
        });
      } catch (error) {
        console.error(error);
        enqueueSnackbar({
          variant: 'gxSnackbar',
          message: t('general.colormapImportFailure'),
          titleMode: 'error'
        });
      }
    };
    reader.readAsText(file);
  };

  const onExport = () => {
    let jsonData;
    try {
      jsonData = JSON.stringify(cellColormapConfig, null, 2);
    } catch (jsonError) {
      console.error('Error stringifying custom colormap:', jsonError);
      enqueueSnackbar({
        message: t('general.colormapExportFailure'),
        variant: 'gxSnackbar',
        titleMode: 'error'
      });
      return;
    }

    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const fileName = 'custom_transcripts-colormap';

    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName}.json`;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    enqueueSnackbar({
      message: t('general.colormapExportSuccess'),
      variant: 'gxSnackbar',
      titleMode: 'success'
    });
  };

  return (
    <Box sx={{ ...(isColormapConfigValid ? {} : sx.disabledWrapper) }}>
      {!isColormapConfigValid && (
        <Box sx={sx.errorContainer}>
          <ErrorIcon sx={sx.errorIcon} />
          <Typography sx={sx.errorText}>{t('general.filterMissingColormap')}</Typography>
        </Box>
      )}
      <Box sx={{ ...(isColormapConfigValid ? {} : sx.disabledSection) }}>
        <CellsFilterOptions />
        <GxFilterTableColormap
          onDrop={onDrop}
          onExport={onExport}
        />
        <CellsFilterTable />
      </Box>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  errorContainer: {
    display: 'flex',
    marginBottom: '8px',
    padding: '16px',
    justifyContent: 'center',
    border: '1px dashed',
    borderColor: theme.palette.gx.accent.error
  },
  errorIcon: {
    color: theme.palette.gx.accent.error,
    marginRight: '8px'
  },
  errorText: {
    color: theme.palette.gx.accent.error,
    fontWeight: 700
  },
  disabledWrapper: {
    cursor: 'not-allowed'
  },
  disabledSection: {
    pointerEvents: 'none',
    opacity: 0.5
  }
});
