import { Box, Input } from '@mui/material';
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
        const newValue =
          +currentValue >= currentMaxValue
            ? currentMaxValue
            : +currentValue < CHANNEL_MIN
              ? CHANNEL_MIN
              : +currentValue;
        setRangeMin(newValue);
        handleSliderChange([newValue, currentMaxValue] as [number, number]);
      }, DEBOUNCE_TIME_MS),
    [currentMaxValue, handleSliderChange, setRangeMin]
  );

  const handleRangeMinInput = useCallback(
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
          +currentValue <= currentMinValue
            ? currentMinValue
            : +currentValue > CHANNEL_MAX
              ? CHANNEL_MAX
              : +currentValue;
        setRangeMax(newValue);
        handleSliderChange([currentMinValue, newValue] as [number, number]);
      }, DEBOUNCE_TIME_MS),
    [currentMinValue, handleSliderChange, setRangeMax]
  );

  const handleRangeMaxInput = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setMaxInputValue(e.target.value);
      debouncedMaxInputChange(e.target.value);
    },
    [debouncedMaxInputChange, setMaxInputValue]
  );
  return (
    <Box sx={sx.container}>
      <Box sx={sx.inputGroup}>
        <label
          htmlFor="slider_range_min"
          style={sx.label}
        >
          {t('channelSettings.sliderRangeMinLabel')}
        </label>
        <Input
          id="slider_range_min"
          type="number"
          sx={sx.input}
          value={rangeMin}
          onChange={handleRangeMinInput}
          inputProps={{
            min: CHANNEL_MIN,
            max: rangeMax - 1,
            step: CHANNEL_STEP
          }}
        />
      </Box>
      <Box sx={sx.inputGroup}>
        <label
          htmlFor="slider_range_max"
          style={sx.label}
        >
          {t('channelSettings.sliderRangeMaxLabel')}
        </label>
        <Input
          id="slider_range_max"
          type="number"
          sx={sx.input}
          value={rangeMax}
          onChange={handleRangeMaxInput}
          inputProps={{
            min: rangeMin + 1,
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
  label: { fontSize: 12, marginBottom: 4, color: '#fff' },
  input: { color: '#fff', input: { color: '#fff' } }
};
