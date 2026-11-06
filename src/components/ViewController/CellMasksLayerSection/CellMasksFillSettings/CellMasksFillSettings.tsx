import { getAppearanceControlStyles } from '../../../../shared/components/appearanceControl.styles';
import { Box, ToggleButton, Input, SxProps, Theme, Typography, useTheme } from '@mui/material';
import { useCellSegmentationLayerStore } from '../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';
import { GxSlider } from '../../../../shared/components/GxSlider';
import { useEffect, useState } from 'react';

const MIN_FILL_OPACITY = 1;
const MAX_FILL_OPACITY = 100;
const FILL_OPACITY_STEP = 1;

export const CellMasksFillSettings = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const sx = styles(theme);
  const [showCellFill, showBoundary, toggleCellFill, cellFillOpacity, setCellFillOpacity] =
    useCellSegmentationLayerStore(
      useShallow((store) => [
        store.showCellFill,
        store.showBoundary,
        store.toggleCellFill,
        store.cellFillOpacity,
        store.setCellFillOpacity
      ])
    );

  const [sliderValue, setSliderValue] = useState<number>(cellFillOpacity);

  const [inputValue, setInputValue] = useState(String(Math.round(cellFillOpacity * 100)));

  useEffect(() => {
    setSliderValue(cellFillOpacity);
    setInputValue(String(Math.round(cellFillOpacity * 100)));
  }, [cellFillOpacity]);

  const commitInputValue = () => {
    const parsed = inputValue.trim() === '' ? NaN : Number(inputValue);
    const clamped = Number.isFinite(parsed)
      ? Math.min(MAX_FILL_OPACITY, Math.max(MIN_FILL_OPACITY, parsed))
      : sliderValue * 100;
    const value = Math.round(clamped);
    setInputValue(String(value));
    setSliderValue(value / 100);
    setCellFillOpacity(value / 100);
  };

  return (
    <Box sx={sx.strokeSettingsContainer}>
      <ToggleButton
        value="fill"
        selected={showCellFill}
        onChange={toggleCellFill}
        disabled={showCellFill && !showBoundary}
        color="primary"
        sx={sx.toggleButton}
      >
        {t('segmentationSettings.fillToggleLabel')}
      </ToggleButton>
      <Box sx={sx.sliderInputContainer}>
        <Typography
          id="cell-fill-alpha-label"
          component="label"
          sx={sx.label}
        >
          {t('segmentationSettings.fillAlphaLabel')}
        </Typography>
        <Box sx={sx.sliderInputItem}>
          <GxSlider
            sx={sx.sliderControl}
            aria-labelledby="cell-fill-alpha-label"
            value={sliderValue * 100}
            onChange={(_, newValue) => {
              const value = Array.isArray(newValue) ? newValue[0] : newValue;
              setSliderValue(+(value / 100).toFixed(2));
              setInputValue(String(Math.round(value)));
            }}
            onChangeCommitted={() => {
              setCellFillOpacity(sliderValue);
            }}
            valueLabelFormat={(value: number) => `${Math.round(value)}%`}
            step={0.1}
            disabled={!showCellFill}
            min={MIN_FILL_OPACITY}
            max={MAX_FILL_OPACITY}
          />
        </Box>
        <Box sx={{ width: 52, flexShrink: 0 }}>
          <Input
            disableUnderline
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            onBlur={commitInputValue}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.currentTarget.querySelector('input')?.blur();
              }
            }}
            size="small"
            type="number"
            inputProps={{
              'aria-labelledby': 'cell-fill-alpha-label',
              step: FILL_OPACITY_STEP.toString(),
              max: MAX_FILL_OPACITY.toString(),
              min: MIN_FILL_OPACITY.toString()
            }}
            sx={sx.input}
            disabled={!showCellFill}
          />
        </Box>
      </Box>
    </Box>
  );
};

const styles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const controls = getAppearanceControlStyles(theme);
  return {
    ...controls,
    strokeSettingsContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '8px'
    },
    sliderInputContainer: {
      display: 'flex',
      flex: 1,
      minWidth: 0,
      alignItems: 'center',
      gap: '8px'
    },
    sliderInputItem: controls.slider
  };
};
