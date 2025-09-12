import { getPixelValueDisplay } from './ChannelController.helpers';
import { ChannelControllerProps } from './ChannelController.types';
import { Box, Grid, IconButton, MenuItem, Theme, Tooltip, Typography, useTheme } from '@mui/material';
import { ChannelOptions } from '../ChannelOptions/ChannelOptions';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { ChannelRangeSlider } from './ChannelRangeSlider/ChannelRangeSlider';
import { GxCheckbox } from '../../../../../shared/components/GxCheckbox';
import { GxSelect } from '../../../../../shared/components/GxSelect';
import { useViewerStore } from '../../../../../stores/ViewerStore';
import { useTranslation } from 'react-i18next';

export const ChannelController = ({
  color,
  name,
  isLoading,
  pixelValue,
  channelVisible,
  slider,
  toggleIsOn,
  onSelectionChange,
  handleColorSelect,
  handleRemoveChannel,
  handleSliderChange
}: ChannelControllerProps) => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();

  const channelOptions = useViewerStore((store) => store.channelOptions);

  return (
    <Grid
      container
      direction="column"
      justifyContent="center"
      gap={1}
    >
      <Box sx={sx.headerWrapper}>
        <GxCheckbox
          onChange={toggleIsOn}
          disabled={isLoading}
          checked={channelVisible}
          disableTouchRipple
        />
        <GxSelect
          value={name}
          onChange={(e) => onSelectionChange(e.target.value as string)}
          sx={sx.channelSelect}
          disabled={isLoading}
        >
          {channelOptions.map((opt) => (
            <MenuItem
              disabled={isLoading}
              key={opt}
              value={opt}
            >
              <Typography>{opt}</Typography>
            </MenuItem>
          ))}
        </GxSelect>
        <Box>
          <ChannelOptions
            handleColorSelect={handleColorSelect as any}
            disabled={isLoading}
          />
          <Tooltip
            title={t('channelSettings.removeChannel')}
            arrow
          >
            <IconButton
              component="span"
              size="small"
              onClick={handleRemoveChannel}
              sx={sx.removeChannelButton}
            >
              <HighlightOffIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      <Box sx={sx.valueWrapper}>
        <Box>{getPixelValueDisplay(pixelValue, isLoading)}</Box>
      </Box>
      <ChannelRangeSlider
        color={color}
        slider={slider}
        handleSliderChange={handleSliderChange}
        isLoading={isLoading}
      />
    </Grid>
  );
};

const styles = (theme: Theme) => ({
  removeChannelButton: {
    '&:hover': {
      color: theme.palette.gx.accent.greenBlue,
      backgroundColor: 'unset'
    }
  },
  headerWrapper: {
    display: 'flex',
    alignItems: 'center'
  },
  valueWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '4px auto 0 0',
    padding: '4px 0',
    borderRadius: '8px',
    background: theme.palette.gx.primary.white,
    width: '50%'
  },
  channelSelect: {
    flexGrow: 1
  },
  textField: {
    marginBottom: '8px',
    width: '60px',
    '& .MuiFormLabel-root.Mui-focused': {
      color: theme.palette.gx.accent.greenBlue
    },
    '&.MuiInputBase-input': {
      cursor: 'auto'
    },
    '&.MuiInputBase-root::after': {
      borderBottom: '2px solid',
      borderColor: theme.palette.gx.accent.greenBlue
    }
  }
});
