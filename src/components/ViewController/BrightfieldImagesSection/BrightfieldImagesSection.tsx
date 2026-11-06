import { getSliderHandleStyles } from '../../../shared/components/sliderControls.styles';
import { Box, Input, Theme, ToggleButton, Typography, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';
import { useBrightfieldImagesStore } from '../../../stores/BrightfieldImagesStore';
import { GxSlider } from '../../../shared/components/GxSlider';
import { getControlButtonStyles } from '../../../shared/components/controlButton.styles';

export const BrightfieldImagesSection = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();
  const [brightfieldImageSource, availableImages, opacity, isLayerVisible, toggleImageLayer] =
    useBrightfieldImagesStore(
      useShallow((store) => [
        store.brightfieldImageSource,
        store.availableImages,
        store.opacity,
        store.isLayerVisible,
        store.toggleImageLayer
      ])
    );
  const isImageEnabled = !!brightfieldImageSource && isLayerVisible;
  const hasImage = !!brightfieldImageSource || availableImages.length > 0;
  const [sliderValue, setSliderValue] = useState(Math.round(opacity * 100));
  const [inputValue, setInputValue] = useState(String(Math.round(opacity * 100)));

  useEffect(() => {
    const percent = Math.round(opacity * 100);
    setSliderValue(percent);
    setInputValue(String(percent));
  }, [opacity]);

  const commitOpacity = (percent: number) => {
    setSliderValue(percent);
    setInputValue(String(percent));
    useBrightfieldImagesStore.setState({ opacity: percent / 100 });
  };

  const commitInputValue = () => {
    const parsed = inputValue.trim() === '' ? NaN : Number(inputValue);
    const percent = Number.isFinite(parsed) ? Math.round(Math.min(100, Math.max(0, parsed))) : sliderValue;
    commitOpacity(percent);
  };

  return (
    <Box sx={sx.row}>
      <ToggleButton
        value="brightfield"
        selected={isImageEnabled}
        onChange={toggleImageLayer}
        disabled={!hasImage}
        color="primary"
        sx={sx.toggleButton}
      >
        {t('brightfieldImages.imageToggleLabel')}
      </ToggleButton>
      <Typography
        id="brightfield-opacity-label"
        component="label"
        sx={sx.label}
      >
        {t('brightfieldImages.opacityLabel')}
      </Typography>
      <Box sx={sx.slider}>
        <GxSlider
          sx={sx.sliderControl}
          aria-labelledby="brightfield-opacity-label"
          value={sliderValue}
          onChange={(_, newValue) => {
            const value = Array.isArray(newValue) ? newValue[0] : newValue;
            setSliderValue(value);
            setInputValue(String(value));
          }}
          onChangeCommitted={(_, newValue) => commitOpacity(Array.isArray(newValue) ? newValue[0] : newValue)}
          valueLabelFormat={(value: number) => `${value}%`}
          min={0}
          max={100}
          step={1}
          disabled={!isImageEnabled}
        />
      </Box>
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
          'aria-labelledby': 'brightfield-opacity-label',
          min: 0,
          max: 100,
          step: 1
        }}
        sx={sx.input}
        disabled={!isImageEnabled}
      />
    </Box>
  );
};

const styles = (theme: Theme) => ({
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    paddingBlock: '20px',
    marginBottom: '8px'
  },
  toggleButton: {
    ...getControlButtonStyles(theme),
    width: 114,
    flexShrink: 0,
    padding: '2px 4px',
    fontSize: '1rem',
    fontWeight: 700
  },
  label: {
    fontSize: '0.75rem',
    flexShrink: 0
  },
  slider: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    padding: '0 4px'
  },
  sliderControl: getSliderHandleStyles(theme),
  input: {
    width: 52,
    flexShrink: 0,
    borderRadius: '6px',
    backgroundColor: theme.palette.gx.darkGrey[500],
    color: theme.palette.getContrastText(theme.palette.gx.darkGrey[500]),
    '& .MuiInputBase-input': {
      textAlign: 'center',
      padding: '3px 6px',
      fontSize: '14px'
    },
    '&.Mui-focused': {
      outline: 'none',
      boxShadow: `inset 0 -2px 0 ${theme.palette.primary.main}`
    }
  }
});
