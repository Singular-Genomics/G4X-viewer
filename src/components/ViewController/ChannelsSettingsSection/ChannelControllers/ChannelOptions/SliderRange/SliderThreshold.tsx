import { Box, Input, Theme, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { SliderThresholdProps } from './SliderThreshold.types';
import { useMemo, ChangeEvent } from 'react';
import { debounce } from 'lodash';
import { CHANNEL_STEP } from '../../ChannelController/ChannelController.helpers';

const DEBOUNCE_TIME_MS = 300;

export const SliderThreshold = ({
  slider,
  domain,
  rangeMin,
  rangeMax,
  setRangeMin,
  setRangeMax,
  setMinInputValue,
  setMaxInputValue,
  handleSliderChange
}: SliderThresholdProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const sx = styles(theme);
  const [currentMinValue, currentMaxValue] = slider;
  const [domainMin, domainMax] = domain;

  const debouncedMinInputChange = useMemo(
    () =>
      debounce((currentValue: string) => {
        if (currentValue === '') return;
        const newValue = Math.max(domainMin, Math.min(+currentValue, currentMaxValue));
        setRangeMin(newValue.toString());
        setMinInputValue(newValue.toString());
        handleSliderChange([newValue, currentMaxValue] as [number, number]);
      }, DEBOUNCE_TIME_MS),
    [currentMaxValue, domainMin, handleSliderChange, setRangeMin, setMinInputValue]
  );

  const handleRangeMinInput = (e: ChangeEvent<HTMLInputElement>) => {
    setRangeMin(e.target.value);
    setMinInputValue(e.target.value);
    debouncedMinInputChange(e.target.value);
  };

  const debouncedMaxInputChange = useMemo(
    () =>
      debounce((currentValue: string) => {
        if (currentValue === '') return;
        const newValue = Math.min(domainMax, Math.max(Number(currentValue), currentMinValue));
        setRangeMax(newValue.toString());
        setMaxInputValue(newValue.toString());
        handleSliderChange([currentMinValue, newValue] as [number, number]);
      }, DEBOUNCE_TIME_MS),
    [currentMinValue, domainMax, handleSliderChange, setRangeMax, setMaxInputValue]
  );

  const handleRangeMaxInput = (e: ChangeEvent<HTMLInputElement>) => {
    setRangeMax(e.target.value);
    setMaxInputValue(e.target.value);
    debouncedMaxInputChange(e.target.value);
  };

  return (
    <Box>
      <Typography sx={sx.sectionHeader}>{t('channelSettings.sliderRangeSectionTitle')}</Typography>
      <Box sx={sx.container}>
        <Box sx={sx.inputGroup}>
          <Typography
            component="label"
            htmlFor="slider_range_min"
            sx={sx.label}
          >
            {t('channelSettings.sliderRangeMinLabel')}
          </Typography>
          <Input
            id="slider_range_min"
            type="number"
            sx={sx.input}
            value={rangeMin}
            onChange={handleRangeMinInput}
            inputProps={{
              min: domainMin,
              max: domainMax,
              step: CHANNEL_STEP
            }}
          />
        </Box>
        <Box sx={sx.inputGroup}>
          <Typography
            component="label"
            htmlFor="slider_range_max"
            sx={sx.label}
          >
            {t('channelSettings.sliderRangeMaxLabel')}
          </Typography>
          <Input
            id="slider_range_max"
            type="number"
            sx={sx.input}
            value={rangeMax}
            onChange={handleRangeMaxInput}
            inputProps={{
              min: domainMin,
              max: domainMax,
              step: CHANNEL_STEP
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  sectionHeader: {
    fontSize: '13px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: theme.palette.gx.accent.greenBlue,
    marginBottom: '8px'
  },
  container: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 3 },
  inputGroup: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' },
  label: { fontSize: 12, display: 'block', color: theme.palette.gx.primary.white },
  input: {
    color: theme.palette.gx.primary.white,
    width: '60px',
    input: { color: theme.palette.gx.primary.white, textAlign: 'left' }
  }
});
