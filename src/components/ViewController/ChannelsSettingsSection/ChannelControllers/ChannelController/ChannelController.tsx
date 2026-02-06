import { CHANNEL_MAX, CHANNEL_MIN, calculateExpandedRange, getPixelValueDisplay } from './ChannelController.helpers';
import { ChannelControllerProps, SliderRangeMode } from './ChannelController.types';
import { Box, Grid, IconButton, MenuItem, Theme, Tooltip, Typography, useTheme } from '@mui/material';
import { ChannelOptions } from '../ChannelOptions/ChannelOptions';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import { ChannelRangeSlider } from './ChannelRangeSlider/ChannelRangeSlider';
import { GxCheckbox } from '../../../../../shared/components/GxCheckbox';
import { GxSelect } from '../../../../../shared/components/GxSelect';
import { useViewerStore } from '../../../../../stores/ViewerStore';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

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
  const [sliderRangeMode, setSliderRangeMode] = useState<SliderRangeMode>('expanded');
  const [rangeMin, setRangeMin] = useState(CHANNEL_MIN.toString());
  const [rangeMax, setRangeMax] = useState(CHANNEL_MAX.toString());
  const [minInputValue, setMinInputValue] = useState<string>(currentMinValue.toString());
  const [maxInputValue, setMaxInputValue] = useState<string>(currentMaxValue.toString());

  const [expandedInit] = useState(() =>
    calculateExpandedRange(currentMinValue, currentMaxValue, Number(rangeMin), Number(rangeMax))
  );
  const [visibleMin, setVisibleMin] = useState(expandedInit[0]);
  const [visibleMax, setVisibleMax] = useState(expandedInit[1]);

  const handleModeToggle = () => {
    setSliderRangeMode((prev) => {
      const newMode = prev === 'expanded' ? 'contract' : 'expanded';
      const rMin = Number(rangeMin);
      const rMax = Number(rangeMax);
      if (newMode === 'contract') {
        setVisibleMin(rMin);
        setVisibleMax(rMax);
      } else {
        const [eMin, eMax] = calculateExpandedRange(currentMinValue, currentMaxValue, rMin, rMax);
        setVisibleMin(eMin);
        setVisibleMax(eMax);
      }
      return newMode;
    });
  };

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
      <Box sx={sx.valueWrapper}>
        <Box>{getPixelValueDisplay(pixelValue, isLoading)}</Box>
      </Box>
      <Box sx={sx.sliderRow}>
        <Tooltip
          title={t(
            sliderRangeMode === 'expanded'
              ? 'channelSettings.sliderRangeModeExpanded'
              : 'channelSettings.sliderRangeModeContract'
          )}
          arrow
        >
          <IconButton
            size="small"
            onClick={handleModeToggle}
            disabled={isLoading}
            sx={sx.modeToggleButton}
          >
            {sliderRangeMode === 'expanded' ? <UnfoldMoreIcon fontSize="small" /> : <UnfoldLessIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
        <ChannelRangeSlider
          color={color}
          slider={slider}
          handleSliderChange={handleSliderChange}
          isLoading={isLoading}
          visibleMin={visibleMin}
          visibleMax={visibleMax}
          minInputValue={minInputValue}
          maxInputValue={maxInputValue}
          setMinInputValue={setMinInputValue}
          setMaxInputValue={setMaxInputValue}
        />
      </Box>
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
  sliderRow: {
    display: 'flex',
    alignItems: 'center'
  },
  modeToggleButton: {
    '&:hover': {
      color: theme.palette.gx.accent.greenBlue,
      backgroundColor: 'unset'
    }
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
