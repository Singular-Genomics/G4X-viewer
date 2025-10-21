import { useCallback, useEffect, useRef, useState } from 'react';
import { ColorHex, GxColorPickerProps } from './GxColorPicker.types';
import { CalculatePaletteColor, HsvToHex, isTouchEvent } from './GxColorPicker.helpers';
import { useInteractiveColorPicker } from './GxColorPicker.hooks';
import { Box, Button, Slider, Theme, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';

export const GxColorPicker = ({ color, handleColorChange, handleConfirm }: GxColorPickerProps) => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();
  const paletteRef = useRef<HTMLDivElement>(null);
  const [paletteElement, setPaletteElement] = useState<HTMLDivElement | null>(null);

  const { h: currentHue, s: currentSaturation, v: currentValue } = color;

  useEffect(() => {
    if (paletteRef.current) {
      setPaletteElement(paletteRef.current);
    }
  }, []);

  const handlePaletteChange = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const { pageX, pageY } = isTouchEvent(event)
        ? {
            pageX: event.touches[0].pageX,
            pageY: event.touches[0].pageY
          }
        : {
            pageX: event.pageX,
            pageY: event.pageY
          };

      if (paletteElement) {
        handleColorChange(CalculatePaletteColor(currentHue, pageX, pageY, paletteElement.getBoundingClientRect()));
      }
    },
    [paletteElement, currentHue, handleColorChange]
  );

  const { handleMoveStart, toggleDocumentEvents } = useInteractiveColorPicker(paletteElement, handlePaletteChange);

  const handleHueChange = useCallback(
    (newHueValue: number) => {
      handleColorChange({ h: newHueValue, s: currentSaturation, v: currentValue });
    },
    [currentSaturation, currentValue, handleColorChange]
  );

  useEffect(() => toggleDocumentEvents, [toggleDocumentEvents]);

  return (
    <Box sx={sx.colorPickerContainer}>
      <Box>
        <Box
          ref={paletteRef}
          role="presentation"
          sx={sx.palettedWrapper}
          onMouseDown={handleMoveStart}
          onTouchStart={handleMoveStart}
          onMouseLeave={() => toggleDocumentEvents(false)}
          style={{
            background: `
              linear-gradient(to top, #000, transparent), 
              linear-gradient(to right, #fff, ${HsvToHex({
                h: currentHue,
                s: 1,
                v: 1
              })})`
          }}
        >
          <Box
            sx={sx.picker}
            style={{
              backgroundColor: `${currentHue}`,
              top: `${-(currentValue * 100) + 100}%`,
              left: `${currentSaturation * 100}%`
            }}
          />
        </Box>
      </Box>
      <Box sx={sx.hueSliderWrapper}>
        <Slider
          sx={sx.hueSlider(HsvToHex({ h: color.h, s: 1, v: 1 }))}
          min={0}
          max={360}
          value={color.h}
          onChange={(_, newValue) => handleHueChange(newValue)}
        />
        <Button
          sx={sx.confirmButton}
          onClick={handleConfirm}
        >
          {t('general.confirm')}
        </Button>
      </Box>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  colorPickerContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  palettedWrapper: {
    width: '100%',
    height: '160px',
    position: 'relative'
  },
  picker: {
    width: '16px',
    height: '16px',
    border: '2px solid white',
    borderRadius: '100%',
    zIndex: 100,
    position: 'absolute',
    transform: 'translate(-50%, -50%)'
  },
  confirmButton: {
    marginTop: '4px',
    width: '100%',
    color: theme.palette.gx.primary.white,
    background: theme.palette.gx.gradients.brand(),
    fontWeight: 600,
    '&:hover': {
      boxShadow: `0px 4px 24px ${theme.palette.gx.primary.black}`
    }
  },
  hueSliderWrapper: {
    padding: '0 6px'
  },
  hueSlider: (color: ColorHex) => ({
    '& .MuiSlider-rail': {
      backgroundColor: 'transparent',
      opacity: 1,
      height: '12px',
      borderRadius: '2px',
      background: 'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)'
    },
    '& .MuiSlider-track': {
      border: 'red',
      backgroundColor: 'transparent'
    },
    '& .MuiSlider-thumb': {
      width: '24px',
      height: '24px',
      border: '3px solid #FFF',
      background: color
    }
  })
});
