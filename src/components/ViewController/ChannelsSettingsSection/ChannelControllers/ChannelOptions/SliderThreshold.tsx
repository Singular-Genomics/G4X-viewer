import { Box, Input } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

interface SliderProps {
  initialMin: number;
  initialMax: number;
}

const CHANNEL_MIN = 0;
const CHANNEL_MAX = 65535;
const CHANNEL_STEP = 1;

export const SliderThreshold = ({ initialMin, initialMax }: SliderProps) => {
  const [rangeMin, setRangeMin] = useState(initialMin);
  const [rangeMax, setRangeMax] = useState(initialMax);
  const { t } = useTranslation();
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <label
          htmlFor="slider_range_min"
          style={{ fontSize: 12, marginBottom: 0.5, color: '#fff' }}
        >
          {t('channelSettings.sliderRangeMinLabel')}
        </label>
        <Input
          id="slider_range_min"
          type="number"
          sx={{ color: '#fff', input: { color: '#fff' } }}
          value={rangeMin}
          onChange={(e) => {
            const value = Number(e.target.value);
            setRangeMin(value);
            // setMinInputValue(value.toString());
          }}
          inputProps={{
            min: CHANNEL_MIN,
            max: rangeMax - 1,
            step: CHANNEL_STEP
          }}
        />
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
        <label
          htmlFor="slider_range_max"
          style={{ fontSize: 12, marginBottom: 0.5, color: '#fff' }}
        >
          {t('channelSettings.sliderRangeMaxLabel')}
        </label>
        <Input
          id="slider_range_max"
          type="number"
          sx={{ color: '#fff', input: { color: '#fff' } }}
          value={rangeMax}
          onChange={(e) => {
            const value = Number(e.target.value);
            setRangeMax(value);
            // setMaxInputValue(value.toString());
          }}
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
