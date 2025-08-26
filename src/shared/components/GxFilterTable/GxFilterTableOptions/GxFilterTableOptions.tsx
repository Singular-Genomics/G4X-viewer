import { Box, FormControlLabel } from '@mui/material';
import { GxSwitch } from '../../GxSwitch';
import { GxFilterTableOptionsProps } from './GxFilterTableOptions.types';
import { useTranslation } from 'react-i18next';

export const GxFilterTableOptions = ({
  isFilterEnabled,
  isShowDiscardedEnabled,
  onToggleFilter,
  onToggleShowDiscarded
}: GxFilterTableOptionsProps) => {
  const { t } = useTranslation();

  return (
    <Box sx={sx.optionsContainer}>
      <FormControlLabel
        label={t('general.filterEnable')}
        control={
          <GxSwitch
            disableTouchRipple
            onChange={onToggleFilter}
            checked={isFilterEnabled}
          />
        }
      />
      <FormControlLabel
        label={t('general.filterShowDiscarded')}
        control={
          <GxSwitch
            disableTouchRipple
            onChange={onToggleShowDiscarded}
            checked={isShowDiscardedEnabled}
            disabled={!isFilterEnabled}
          />
        }
      />
    </Box>
  );
};

const sx = {
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingLeft: '8px',
    marginBottom: '8px'
  }
};
