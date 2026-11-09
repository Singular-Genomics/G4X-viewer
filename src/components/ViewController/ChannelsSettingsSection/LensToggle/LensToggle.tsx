import { SettingsTooltip as Tooltip } from '../../../../shared/components/SettingsHelp';
import { Box, MenuItem, Theme, ToggleButton, Typography, useTheme } from '@mui/material';
import { GxSelect } from '../../../../shared/components/GxSelect/GxSelect';
import { getControlButtonStyles } from '../../../../shared/components/controlButton.styles';
import { useChannelsStore } from '../../../../stores/ChannelsStore/ChannelsStore';
import { useViewerStore } from '../../../../stores/ViewerStore/ViewerStore';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';

export const LensToggle = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();
  const selections = useChannelsStore((store) => store.selections);
  const [isLensOn, lensSelection, channelOptions, toggleLens] = useViewerStore(
    useShallow((store) => [store.isLensOn, store.lensSelection, store.channelOptions, store.toggleLens])
  );

  const currentChannelIndices = selections.map((sel) => sel.c);
  const hasChannels = currentChannelIndices.length > 0;

  return (
    <Box sx={sx.row}>
      <Tooltip
        title={t('tooltips.channelSettings.lens')}
        arrow
      >
        <Box
          component="span"
          sx={sx.toggleWrapper}
        >
          <ToggleButton
            value="lens"
            selected={isLensOn}
            onChange={toggleLens}
            disabled={!hasChannels}
            color="primary"
            sx={sx.toggleButton}
          >
            {t('channelSettings.lens')}
          </ToggleButton>
        </Box>
      </Tooltip>
      <Tooltip
        title={t('tooltips.channelSettings.lens')}
        helpTitle={t('channelSettings.lens')}
      >
        <Box sx={sx.selector}>
          <GxSelect
            sx={sx.select}
            value={lensSelection}
            fullWidth
            disabled={!hasChannels}
            inputProps={{ 'aria-label': t('channelSettings.highlightedChannel') }}
            onChange={(e) =>
              useViewerStore.setState({
                lensSelection: e.target.value as number
              })
            }
          >
            {currentChannelIndices.map((channelIndex, relativeIndex) => (
              <MenuItem
                key={channelOptions[channelIndex as number] + String(relativeIndex)}
                value={relativeIndex}
              >
                <Typography>{channelOptions[channelIndex as number]}</Typography>
              </MenuItem>
            ))}
          </GxSelect>
        </Box>
      </Tooltip>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  select: {
    height: '36px',
    '& .MuiOutlinedInput-notchedOutline, &:hover .MuiOutlinedInput-notchedOutline, &.Mui-focused .MuiOutlinedInput-notchedOutline':
      {
        border: 0
      }
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingLeft: '8px',
    marginBottom: '8px'
  },
  toggleWrapper: {
    display: 'inline-flex',
    flexShrink: 0
  },
  toggleButton: { ...getControlButtonStyles(theme) },
  selector: {
    flex: 1,
    minWidth: 0,
    maxWidth: '200px',
    marginLeft: 'auto'
  }
});
