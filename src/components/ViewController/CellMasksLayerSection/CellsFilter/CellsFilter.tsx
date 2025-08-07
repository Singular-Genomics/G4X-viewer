import { useCellSegmentationLayerStore } from '../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { CellsFilterOptions } from './CellsFilterOptions';
import { CellsFilterTable } from './CellsFilterTable';
import { Box, Theme, Typography, useTheme } from '@mui/material';
import ErrorIcon from '@mui/icons-material/Error';
import { useTranslation } from 'react-i18next';

export const CellsFilter = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const sx = styles(theme);
  const colormapConfig = useCellSegmentationLayerStore((store) => store.cellColormapConfig);

  const isColormapConfigValid = colormapConfig && colormapConfig.length;

  return (
    <Box sx={{ ...(isColormapConfigValid ? {} : sx.disabledWrapper) }}>
      {!isColormapConfigValid && (
        <Box sx={sx.errorContainer}>
          <ErrorIcon sx={sx.errorIcon} />
          <Typography sx={sx.errorText}>{t('filterMissingColormap')}</Typography>
        </Box>
      )}
      <Box sx={{ ...(isColormapConfigValid ? {} : sx.disabledSection) }}>
        <CellsFilterOptions />
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
