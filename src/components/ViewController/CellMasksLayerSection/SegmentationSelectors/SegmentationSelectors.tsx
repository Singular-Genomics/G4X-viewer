import { Box, CircularProgress, MenuItem, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { GxSelect } from '../../../../shared/components/GxSelect';
import { useSegmentationSelectors } from '../useSegmentationSelectors.hook';

export const SegmentationSelectors = () => {
  const { t } = useTranslation();

  const {
    isLoading,
    availableSegmentations,
    selectedSegmentationLabel,
    availableClusterLabels,
    selectedClusterLabelKey,
    handleSegmentationChange,
    handleClusterLabelChange
  } = useSegmentationSelectors();

  const showSegmentationSelector = availableSegmentations.length > 0;
  const showClusterLabelSelector = availableClusterLabels.length > 1;

  if (!showSegmentationSelector && !showClusterLabelSelector) {
    return null;
  }

  return (
    <Box sx={sx.wrapper}>
      {showSegmentationSelector && (
        <Box>
          <Typography sx={sx.label}>{t('segmentationSettings.segmentationSelectLabel')}</Typography>
          <Box sx={sx.selectWrapper}>
            <GxSelect
              value={selectedSegmentationLabel}
              onChange={(e) => handleSegmentationChange(e.target.value as string)}
              disabled={isLoading}
              fullWidth
            >
              {availableSegmentations.map((seg) => (
                <MenuItem
                  key={seg.label}
                  value={seg.label}
                >
                  {seg.label}
                </MenuItem>
              ))}
            </GxSelect>
            {isLoading && (
              <CircularProgress
                size={16}
                sx={sx.spinner}
              />
            )}
          </Box>
        </Box>
      )}
      {showClusterLabelSelector && (
        <Box>
          <Typography sx={sx.label}>{t('segmentationSettings.clusterLabelSelectLabel')}</Typography>
          <Box sx={sx.selectWrapper}>
            <GxSelect
              value={selectedClusterLabelKey}
              onChange={(e) => handleClusterLabelChange(e.target.value as string)}
              disabled={isLoading}
              fullWidth
            >
              {availableClusterLabels.map((label) => (
                <MenuItem
                  key={label.key}
                  value={label.key}
                >
                  {label.displayName}
                </MenuItem>
              ))}
            </GxSelect>
            {isLoading && (
              <CircularProgress
                size={16}
                sx={sx.spinner}
              />
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
};

const sx = {
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingBottom: '4px'
  },
  label: {
    fontSize: '14px',
    fontWeight: 700,
    paddingLeft: '8px',
    marginBottom: '4px'
  },
  selectWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  spinner: {
    flexShrink: 0
  }
};
