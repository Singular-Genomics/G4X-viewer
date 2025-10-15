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
    <Box sx={sx.container}>
      <Box sx={sx.inputGroup}>
        <label
          htmlFor="slider_range_min"
          style={sx.label as React.CSSProperties}
        >
          {t('channelSettings.sliderRangeMinLabel')}
        </label>
        <Input
          id="slider_range_min"
          type="number"
          sx={sx.input}
          value={rangeMin}
          onChange={(e) => {
            const value = Number(e.target.value);
            setRangeMin(value);
          }}
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
          style={sx.label as React.CSSProperties}
        >
          {t('channelSettings.sliderRangeMaxLabel')}
        </label>
        <Input
          id="slider_range_max"
          type="number"
          sx={sx.input}
          value={rangeMax}
          onChange={(e) => {
            const value = Number(e.target.value);
            setRangeMax(value);
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

const sx = {
  container: { display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1, marginTop: 4 },
  inputGroup: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start' },
  label: { fontSize: 12, marginBottom: 4, color: '#fff' },
  input: { color: '#fff', input: { color: '#fff' } }
};
