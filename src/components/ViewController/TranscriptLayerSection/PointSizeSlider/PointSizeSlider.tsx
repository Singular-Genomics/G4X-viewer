import { SettingsTooltip } from '../../../../shared/components/SettingsHelp';
import { useShallow } from 'zustand/react/shallow';
import { Box, Input, Typography, useTheme } from '@mui/material';
import { useTranscriptLayerStore } from '../../../../stores/TranscriptLayerStore';
import { GxSlider } from '../../../../shared/components/GxSlider';
import { getAppearanceControlStyles } from '../../../../shared/components/appearanceControl.styles';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const MIN_POINT_SIZE = 0.1;
const MAX_POINT_SIZE = 10;
const POINT_SIZE_STEP = 0.1;

export const PointSizeSlider = () => {
  const controls = getAppearanceControlStyles(useTheme());
  const { t } = useTranslation();
  const [pointSize, setPointSize] = useTranscriptLayerStore(
    useShallow((store) => [store.pointSize, store.setPointSize])
  );
  const [sliderValue, setSliderValue] = useState(pointSize);
  const [inputValue, setInputValue] = useState(String(pointSize));

  useEffect(() => {
    setSliderValue(pointSize);
    setInputValue(String(pointSize));
  }, [pointSize]);

  const commitSize = (value: number) => {
    setSliderValue(value);
    setInputValue(String(value));
    setPointSize(value);
  };

  const commitInputValue = () => {
    const parsed = inputValue.trim() === '' ? NaN : Number(inputValue);
    const value = Number.isFinite(parsed)
      ? +Math.min(MAX_POINT_SIZE, Math.max(MIN_POINT_SIZE, parsed)).toFixed(1)
      : sliderValue;
    commitSize(value);
  };

  return (
    <SettingsTooltip
      title={t('settingsHelp.controls.pointSize')}
      helpTitle={t('transcriptsSettings.pointSize')}
    >
      <Box sx={sx.row}>
        <Typography
          id="transcript-point-size-label"
          component="label"
          sx={sx.label}
        >
          {t('transcriptsSettings.pointSize')}
        </Typography>
        <Box sx={controls.slider}>
          <GxSlider
            sx={controls.sliderControl}
            aria-labelledby="transcript-point-size-label"
            value={sliderValue}
            onChangeCommitted={(_, newValue) => commitSize(Array.isArray(newValue) ? newValue[0] : newValue)}
            onChange={(_, newValue) => {
              const value = Array.isArray(newValue) ? newValue[0] : newValue;
              setSliderValue(value);
              setInputValue(String(value));
            }}
            step={POINT_SIZE_STEP}
            min={MIN_POINT_SIZE}
            max={MAX_POINT_SIZE}
          />
        </Box>
        <Input
          disableUnderline
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onBlur={commitInputValue}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.querySelector('input')?.blur();
          }}
          size="small"
          type="number"
          inputProps={{
            'aria-labelledby': 'transcript-point-size-label',
            step: POINT_SIZE_STEP,
            max: MAX_POINT_SIZE,
            min: MIN_POINT_SIZE
          }}
          sx={controls.input}
        />
      </Box>
    </SettingsTooltip>
  );
};

const sx = {
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px'
  },
  label: {
    width: 114,
    flexShrink: 0,
    paddingLeft: '8px',
    fontSize: '1rem',
    fontWeight: 700
  }
};
