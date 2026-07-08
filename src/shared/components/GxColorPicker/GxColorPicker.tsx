import { useCallback, useEffect, useRef, useState } from 'react';
import { ColorHex, GxColorPickerProps } from './GxColorPicker.types';
import {
  CalculatePaletteColor,
  HexToHsv,
  HsvToHex,
  HsvToRgb,
  RgbToHsv,
  isTouchEvent,
  isValidHex
} from './GxColorPicker.helpers';
import { useInteractiveColorPicker } from './GxColorPicker.hooks';
import { alpha, Box, Button, IconButton, Slider, Theme, Tooltip, useTheme } from '@mui/material';
import LensIcon from '@mui/icons-material/Lens';
import { useTranslation } from 'react-i18next';
import { useShallow } from 'zustand/react/shallow';
import { GxInput } from '../GxInput/GxInput';
import { useRecentColorsStore } from '../../../stores/RecentColorsStore';

export const GxColorPicker = ({ color, handleColorChange, handleConfirm, defaultColor }: GxColorPickerProps) => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();
  const paletteRef = useRef<HTMLDivElement>(null);
  const [paletteElement, setPaletteElement] = useState<HTMLDivElement | null>(null);
  const [confirmedColor, setConfirmedColor] = useState(color);
  const [hexInputValue, setHexInputValue] = useState(HsvToHex(color));

  const [recentColors, addRecentColor] = useRecentColorsStore(
    useShallow((store) => [store.recentColors, store.addRecentColor])
  );

  const { h: currentHue, s: currentSaturation, v: currentValue } = color;

  const isColorUnchanged = color.h === confirmedColor.h && color.s === confirmedColor.s && color.v === confirmedColor.v;
  const isDefaultColor =
    !defaultColor || (color.h === defaultColor.h && color.s === defaultColor.s && color.v === defaultColor.v);

  useEffect(() => {
    setHexInputValue(HsvToHex(color));
  }, [color]);

  const handleResetClick = () => {
    if (defaultColor) {
      handleColorChange(defaultColor);
    }
  };

  const handleConfirmClick = () => {
    handleConfirm();
    const { r, g, b } = HsvToRgb(color);
    addRecentColor([r, g, b]);
    setConfirmedColor(color);
  };

  const handleHexInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setHexInputValue(value);
    if (isValidHex(value)) {
      handleColorChange(HexToHsv(value));
    }
  };

  const handleHexInputBlur = () => {
    if (!isValidHex(hexInputValue)) {
      setHexInputValue(HsvToHex(color));
    }
  };

  const handleHexInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    }
  };

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

  const handlePredefinedColorSelect = (predefinedColor: number[]) => {
    const [r, g, b] = predefinedColor;
    handleColorChange(RgbToHsv({ r, g, b }));
  };

  return (
    <Box sx={sx.colorPickerContainer}>
      <Box sx={sx.topRow}>
        <Box sx={sx.swatchesGroup}>
          <Box
            sx={sx.colorSwatch}
            style={{ backgroundColor: HsvToHex(confirmedColor) }}
            title={t('general.previousColor')}
          />
          <Box
            sx={sx.colorSwatch}
            style={{ backgroundColor: HsvToHex(color) }}
            title={t('general.currentColor')}
          />
        </Box>
        <GxInput
          size="small"
          sx={sx.hexInput}
          value={hexInputValue}
          onChange={handleHexInputChange}
          onBlur={handleHexInputBlur}
          onKeyDown={handleHexInputKeyDown}
          slotProps={{ htmlInput: { 'aria-label': t('general.hexColor'), maxLength: 7 } }}
        />
      </Box>
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
      </Box>
      {recentColors.length > 0 && (
        <Box sx={sx.predefinedColorsContainer}>
          {recentColors.map((recentColor, index) => (
            <IconButton
              key={index}
              sx={sx.predefinedColorButton}
              onClick={() => handlePredefinedColorSelect(recentColor)}
            >
              <LensIcon
                sx={sx.predefinedColorIcon}
                fontSize="small"
                style={{ color: `rgb(${recentColor})` }}
              />
            </IconButton>
          ))}
        </Box>
      )}
      <Box sx={sx.actionsRow}>
        {defaultColor && (
          <Tooltip
            title={t('general.resetColorTooltip')}
            arrow
          >
            <span style={{ display: 'flex', flex: 1 }}>
              <Button
                sx={sx.resetButton}
                onClick={handleResetClick}
                disabled={isDefaultColor}
              >
                {t('general.reset')}
              </Button>
            </span>
          </Tooltip>
        )}
        <Button
          sx={sx.confirmButton}
          onClick={handleConfirmClick}
          disabled={isColorUnchanged}
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
  topRow: {
    display: 'flex',
    alignItems: 'stretch',
    gap: '8px'
  },
  swatchesGroup: {
    display: 'flex',
    border: `1px solid ${theme.palette.gx.mediumGrey[500]}`,
    flexShrink: 0
  },
  colorSwatch: {
    width: '36px'
  },
  hexInput: {
    flex: 1,
    '& .MuiInputBase-input': {
      color: theme.palette.gx.lightGrey[900]
    },
    '& .MuiOutlinedInput-notchedOutline': {
      transition: 'border-color 0.2s ease'
    },
    '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme.palette.gx.mediumGrey[300]
    }
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
  actionsRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '4px'
  },
  resetButton: {
    flex: 1,
    color: theme.palette.gx.lightGrey[900],
    border: `1px solid ${theme.palette.gx.mediumGrey[500]}`,
    fontWeight: 600,
    '&:hover': {
      borderColor: theme.palette.gx.lightGrey[500],
      backgroundColor: alpha(theme.palette.gx.primary.white, 0.05)
    },
    '&.Mui-disabled': {
      color: alpha(theme.palette.gx.lightGrey[900], 0.3),
      borderColor: theme.palette.gx.darkGrey[300]
    }
  },
  confirmButton: {
    flex: 1,
    color: theme.palette.gx.primary.white,
    background: theme.palette.gx.gradients.brand(),
    fontWeight: 600,
    '&:hover': {
      boxShadow: `0px 4px 24px ${theme.palette.gx.primary.black}`
    },
    '&.Mui-disabled': {
      color: alpha(theme.palette.gx.primary.white, 0.5),
      background: theme.palette.gx.darkGrey[300]
    }
  },
  predefinedColorsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  predefinedColorButton: {
    padding: '4px',
    height: '28px',
    flex: '0 0 12.5%'
  },
  predefinedColorIcon: {
    width: '24px',
    height: '24px'
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
