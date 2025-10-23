import { Box, Input, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { SliderThresholdProps } from './SliderThreshold.types';
import { useCallback, useMemo, ChangeEvent } from 'react';
import { debounce } from 'lodash';
const CHANNEL_MIN = 0;
const CHANNEL_MAX = 65535;
const CHANNEL_STEP = 1;
const DEBOUNCE_TIME_MS = 300;

export const SliderThreshold = ({
  slider,
  rangeMin,
  rangeMax,
  setRangeMin,
  setRangeMax,
  setMinInputValue,
  setMaxInputValue,
  handleSliderChange
}: SliderThresholdProps) => {
  const { t } = useTranslation();
  const [currentMinValue, currentMaxValue] = slider;

  const debouncedMinInputChange = useMemo(
    () =>
      debounce((currentValue: string) => {
        if (currentValue === '') return;
        const newValue = Math.max(CHANNEL_MIN, Math.min(+currentValue, currentMaxValue));
        setRangeMin(newValue.toString());
        setMinInputValue(newValue.toString());
        handleSliderChange([newValue, currentMaxValue] as [number, number]);
      }, DEBOUNCE_TIME_MS),
    [currentMaxValue, handleSliderChange, setRangeMin, setMinInputValue]
  );

  const handleRangeMinInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setRangeMin(e.target.value);
      setMinInputValue(e.target.value);
      debouncedMinInputChange(e.target.value);
    },
    [debouncedMinInputChange, setRangeMin, setMinInputValue]
  );

  const debouncedMaxInputChange = useMemo(
    () =>
      debounce((currentValue: string) => {
        if (currentValue === '') return;
        const newValue = Math.min(CHANNEL_MAX, Math.max(Number(currentValue), currentMinValue));
        setRangeMax(newValue.toString());
        setMaxInputValue(newValue.toString());
        handleSliderChange([currentMinValue, newValue] as [number, number]);
      }, DEBOUNCE_TIME_MS),
    [currentMinValue, handleSliderChange, setRangeMax, setMaxInputValue]
  );

  const handleRangeMaxInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setRangeMax(e.target.value);
      setMaxInputValue(e.target.value);
      debouncedMaxInputChange(e.target.value);
    },
    [debouncedMaxInputChange, setMaxInputValue, setRangeMax]
  );
  return (
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
            min: CHANNEL_MIN,
            max: CHANNEL_MAX,
            step: CHANNEL_STEP
          }}
        />
      </Box>
      <Box sx={sx.inputGroup}>
        <Typography
          component="label"
          htmlFor="slider_range_min"
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
            min: CHANNEL_MIN,
            max: CHANNEL_MAX,
            step: CHANNEL_STEP
          }}
        />
      </Box>
    </Box>
  );
};

const sx = {
  container: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1, marginTop: 4 },
  inputGroup: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' },
  label: { fontSize: 12, display: 'block', pmarginBottom: 2, color: '#fff' },
  input: { color: '#fff', input: { color: '#fff' } }
};
