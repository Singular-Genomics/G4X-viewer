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
        <Box sx={sx.row}>
          <Typography sx={sx.label}>{t('segmentationSettings.segmentationSelectLabel')}</Typography>
          <Box sx={sx.selectWrapper}>
            <GxSelect
              sx={sx.select}
              inputProps={{ 'aria-label': t('segmentationSettings.segmentationSelectLabel') }}
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
        <Box sx={sx.row}>
          <Typography sx={sx.label}>{t('segmentationSettings.clusterLabelSelectLabel')}</Typography>
          <Box sx={sx.selectWrapper}>
            <GxSelect
              sx={sx.select}
              inputProps={{ 'aria-label': t('segmentationSettings.clusterLabelSelectLabel') }}
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
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingLeft: '8px'
  },
  label: {
    fontWeight: 700,
    flexShrink: 0,
    whiteSpace: 'nowrap'
  },
  selectWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    maxWidth: '200px',
    marginLeft: 'auto'
  },
  select: {
    height: '36px',
    '& .MuiOutlinedInput-notchedOutline, &:hover .MuiOutlinedInput-notchedOutline, &.Mui-focused .MuiOutlinedInput-notchedOutline':
      {
        border: 0
      },
    '&.Mui-disabled .MuiSelect-select': {
      paddingRight: '60px'
    }
  },
  spinner: {
    position: 'absolute',
    right: '36px',
    pointerEvents: 'none'
  }
};
