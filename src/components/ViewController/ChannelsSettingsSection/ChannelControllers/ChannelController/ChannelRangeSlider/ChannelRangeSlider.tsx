import { Box, Input, SxProps, Theme, useTheme } from '@mui/material';
import { CHANNEL_STEP, colormapToRgb } from '../ChannelController.helpers';
import { ChannelRangeSliderProps } from './ChannelRangeSlider.types';
import { ChangeEvent, useCallback, useEffect, useMemo } from 'react';
import { debounce } from 'lodash';
import { useViewerStore } from '../../../../../../stores/ViewerStore';
import { GxSlider } from '../../../../../../shared/components/GxSlider';
import { InfoTooltip } from '../../../../../InfoTooltip';
import { useTranslation } from 'react-i18next';

const DEBOUNCE_TIME_MS = 300;

export const ChannelRangeSlider = ({
  color,
  slider,
  domain,
  handleSliderChange,
  isLoading,
  visibleMin,
  visibleMax,
  minInputValue,
  maxInputValue,
  setMinInputValue,
  setMaxInputValue
}: ChannelRangeSliderProps) => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();

  const [currentMinValue, currentMaxValue] = slider;
  const [domainMin, domainMax] = domain;

  useEffect(() => {
    setMinInputValue(currentMinValue.toString());
    setMaxInputValue(currentMaxValue.toString());
  }, [currentMaxValue, currentMinValue, setMinInputValue, setMaxInputValue]);

  const colormap = useViewerStore((store) => store.colormap);
  const rgbColor = colormapToRgb(!!colormap, color);

  const debouncedMinInputChange = useMemo(
    () =>
      debounce((currentValue: string) => {
        if (currentValue === '') return;
        const newValue =
          +currentValue >= currentMaxValue ? currentMaxValue : +currentValue < domainMin ? domainMin : +currentValue;
        setMinInputValue(newValue.toString());
        handleSliderChange([newValue, currentMaxValue] as [number, number]);
      }, DEBOUNCE_TIME_MS),
    [currentMaxValue, domainMin, handleSliderChange, setMinInputValue]
  );

  const handleMinInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setMinInputValue(e.target.value);
      debouncedMinInputChange(e.target.value);
    },
    [debouncedMinInputChange, setMinInputValue]
  );

  const debouncedMaxInputChange = useMemo(
    () =>
      debounce((currentValue: string) => {
        if (currentValue === '') return;
        const newValue =
          +currentValue <= currentMinValue ? currentMinValue : +currentValue > domainMax ? domainMax : +currentValue;
        setMaxInputValue(newValue.toString());
        handleSliderChange([currentMinValue, newValue] as [number, number]);
      }, DEBOUNCE_TIME_MS),
    [currentMinValue, domainMax, handleSliderChange, setMaxInputValue]
  );

  const handleMaxInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setMaxInputValue(e.target.value);
      debouncedMaxInputChange(e.target.value);
    },
    [debouncedMaxInputChange, setMaxInputValue]
  );

  return (
    <Box sx={sx.sliderContainer}>
      <Input
        id="channel_min"
        type="number"
        sx={sx.textField}
        value={minInputValue}
        onChange={handleMinInputChange}
        inputProps={{
          max: domainMax,
          step: CHANNEL_STEP
        }}
      />
      <GxSlider
        disabled={isLoading}
        value={slider}
        onChange={(_, newValue) => handleSliderChange(newValue as [number, number])}
        valueLabelDisplay="off"
        min={visibleMin}
        max={visibleMax}
        step={CHANNEL_STEP}
        orientation="horizontal"
        style={{ color: rgbColor }}
        sx={sx.rangeSlider}
      />
      <Input
        id="channel_max"
        type="number"
        sx={sx.textField}
        value={maxInputValue}
        onChange={handleMaxInputChange}
        inputProps={{
          max: domainMax,
          step: CHANNEL_STEP
        }}
      />
      <InfoTooltip title={t('tooltips.channelSettings.minMaxDisplay')} />
    </Box>
  );
};

const styles = (theme: Theme): Record<string, SxProps> => ({
  sliderContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '20px',
    padding: '0 2px'
  },
  textField: {
    marginBottom: '8px',
    minWidth: '60px',
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
  },
  rangeSlider: {
    '& .MuiSlider-thumb': {
      height: '16px',
      width: '16px'
    }
  }
});
