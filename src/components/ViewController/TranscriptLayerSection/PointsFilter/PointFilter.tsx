import { Box, Theme, Typography, useTheme } from '@mui/material';
import { PointFilterOptions } from './PointFilterOptions';
import { PointFiltersTable } from './PointFiltersTable';
import ErrorIcon from '@mui/icons-material/Error';
import { useBinaryFilesStore } from '../../../../stores/BinaryFilesStore';
import { useTranslation } from 'react-i18next';

export const PointFilter = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const sx = styles(theme);
  const colormapConfig = useBinaryFilesStore((store) => store.colorMapConfig);

  const isColormapConfigValid = colormapConfig && colormapConfig.length;

  return (
    <Box sx={{ ...(isColormapConfigValid ? {} : sx.disabledWrapper) }}>
      {!isColormapConfigValid && (
        <Box sx={sx.errorContainer}>
          <ErrorIcon sx={sx.errorIcon} />
          <Typography sx={sx.errorText}>{t('general.filterMissingColormap')}</Typography>
        </Box>
      )}
      <Box sx={{ ...(isColormapConfigValid ? {} : sx.disabledSection) }}>
        <PointFilterOptions />
        <PointFiltersTable />
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
