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
import { useState } from 'react';
import { InfoTooltip } from '../../../../InfoTooltip';

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
  const [currentMinValue, currentMaxValue] = slider;
  const [rangeMin, setRangeMin] = useState(currentMinValue.toString());
  const [rangeMax, setRangeMax] = useState(currentMaxValue.toString());
  const [minInputValue, setMinInputValue] = useState<string>('');
  const [maxInputValue, setMaxInputValue] = useState<string>('');

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
            slider={slider}
            handleColorSelect={handleColorSelect as any}
            disabled={isLoading}
            rangeMin={rangeMin}
            rangeMax={rangeMax}
            setRangeMin={setRangeMin}
            setRangeMax={setRangeMax}
            setMinInputValue={setMinInputValue}
            setMaxInputValue={setMaxInputValue}
            handleSliderChange={handleSliderChange}
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
      <Box sx={sx.pixelIntensityContainer}>
        <Box sx={sx.valueWrapper}>
          <Box>{getPixelValueDisplay(pixelValue, isLoading)}</Box>
        </Box>
        <InfoTooltip title={t('tooltips.channelSettings.currentPixelIntensity')} />
      </Box>
      <ChannelRangeSlider
        color={color}
        slider={slider}
        handleSliderChange={handleSliderChange}
        isLoading={isLoading}
        rangeMin={rangeMin}
        rangeMax={rangeMax}
        minInputValue={minInputValue}
        maxInputValue={maxInputValue}
        setMinInputValue={setMinInputValue}
        setMaxInputValue={setMaxInputValue}
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
  pixelIntensityContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  valueWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '2px 0 0 0',
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
