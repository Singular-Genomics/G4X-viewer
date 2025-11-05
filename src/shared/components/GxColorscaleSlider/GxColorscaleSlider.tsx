import { alpha, Slider, SxProps, Theme, useTheme } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { debounce } from 'lodash';
import { GxColorscaleSliderProps } from './GxColorscaleSlider.types';

export const GxColorscaleSlider = ({
  scaleMin,
  scaleMax,
  disabled,
  colorscale,
  lowerThreshold,
  upperThreshold,
  onThresholdChange
}: GxColorscaleSliderProps) => {
  const theme = useTheme();
  const sx = styles(theme);
  const [sliderValue, setSliderValues] = useState<number[]>([0, 1]);

  const handleChange = (_: Event, newValue: number[]) => {
    setSliderValues(newValue);
    debouncedUpdate(newValue[0], newValue[1]);
  };

  const debouncedUpdate = useMemo(
    () =>
      debounce((newLowerThreshold: number, newUpperThreshold: number) => {
        onThresholdChange(newLowerThreshold, newUpperThreshold);
      }, 500),
    [onThresholdChange]
  );

  const marks = useMemo(() => {
    if (typeof scaleMax !== 'undefined' && typeof scaleMin !== 'undefined') {
      const totalRange = scaleMax - scaleMin;
      return [0, 0.25, 0.5, 0.75, 1].map((percentage) => ({
        value: percentage,
        label: (scaleMin + percentage * totalRange).toFixed(1)
      }));
    }
  }, [scaleMax, scaleMin]);

  useEffect(() => {
    setSliderValues([lowerThreshold || 0, upperThreshold || 1]);
    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Slider
      value={disabled ? [0, 100] : sliderValue}
      onChange={handleChange}
      marks={marks}
      disabled={disabled}
      min={0}
      max={1}
      step={0.01}
      sx={{
        ...sx.slider,
        '& .MuiSlider-track ': {
          height: '16px',
          borderRadius: 'unset',
          ...(colorscale
            ? {
                backgroundImage: `linear-gradient(${colorscale.reversed ? '-90' : '90'}deg, ${colorscale.value
                  .map((entry) => {
                    const percentage = entry[0];
                    const color = entry[1];
                    return `${color} ${percentage * 100}%`;
                  })
                  .join(', ')})`
              }
            : {})
        },
        '& .MuiSlider-rail': {
          backgroundColor: 'unset',
          backgroundImage: `
            linear-gradient(
            90deg, 
            ${colorscale.reversed ? colorscale.value[colorscale.value.length - 1][1] : colorscale.value[0][1]} ${Math.ceil(sliderValue[0] * 100)}%, 
            ${!colorscale.reversed ? colorscale.value[colorscale.value.length - 1][1] : colorscale.value[0][1]} ${Math.ceil(sliderValue[1] * 100)}%
            )`,
          height: '16px',
          borderRadius: 'unset',
          opacity: 1
        }
      }}
    />
  );
};

const styles = (theme: Theme): Record<string, SxProps> => ({
  slider: {
    marginTop: '3px',
    '&.MuiSlider-root': {
      color: theme.palette.gx.accent.greenBlue
    },
    '& .MuiSlider-thumb': {
      borderRadius: 'unset',
      width: '8px'
    },
    '& .MuiSlider-mark': {
      height: '16px',
      width: '1px',
      backgroundColor: theme.palette.gx.primary.black
    },
    '& .MuiSlider-thumb:hover': {
      boxShadow: `0px 0px 0px 8px ${alpha(theme.palette.gx.accent.greenBlue, 0.3)}`
    },
    '&.MuiSlider-root.Mui-disabled': {
      color: theme.palette.gx.mediumGrey[100]
    }
  }
});
