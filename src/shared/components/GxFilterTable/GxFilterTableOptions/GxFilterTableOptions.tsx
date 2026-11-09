import { SettingsTooltip } from '../../SettingsHelp';
import { getControlButtonStyles } from '../../controlButton.styles';
import { Box, Button, ToggleButton, Theme, useTheme } from '@mui/material';
import { GxFilterTableOptionsProps } from './GxFilterTableOptions.types';
import { useTranslation } from 'react-i18next';

export const GxFilterTableOptions = ({
  isFilterEnabled,
  isShowDiscardedEnabled,
  onToggleFilter,
  onToggleShowDiscarded,
  onClearFilters,
  clearDisabled
}: GxFilterTableOptionsProps) => {
  const { t } = useTranslation();
  const sx = styles(useTheme());

  return (
    <Box sx={sx.optionsContainer}>
      <SettingsTooltip
        title={t('settingsHelp.controls.filterEnable')}
        helpTitle={t('general.filterEnable')}
      >
        <ToggleButton
          value="enable"
          selected={isFilterEnabled}
          onChange={onToggleFilter}
          color="primary"
        >
          {t('general.filterEnable')}
        </ToggleButton>
      </SettingsTooltip>
      <SettingsTooltip
        title={t('settingsHelp.controls.filterDiscarded')}
        helpTitle={t('general.filterShowDiscarded')}
      >
        <ToggleButton
          value="showDiscarded"
          selected={isFilterEnabled && isShowDiscardedEnabled}
          onChange={onToggleShowDiscarded}
          disabled={!isFilterEnabled}
          color="primary"
        >
          {t('general.filterShowDiscarded')}
        </ToggleButton>
      </SettingsTooltip>
      <SettingsTooltip
        title={t('settingsHelp.controls.filterClear')}
        helpTitle={t('general.clear')}
      >
        <Button
          variant="outlined"
          onClick={onClearFilters}
          disabled={clearDisabled}
        >
          {t('general.clear')}
        </Button>
      </SettingsTooltip>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  optionsContainer: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr',
    gap: '8px',
    marginBottom: '8px',
    '& button': {
      ...getControlButtonStyles(theme),
      minWidth: 0,
      padding: '6px 4px',
      fontSize: '0.75rem',
      whiteSpace: 'nowrap'
    }
  }
});
