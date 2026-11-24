import { CircularProgress } from '@mui/material';
import { FILL_PIXEL_VALUE } from '../../../../../shared/constants';
import { SliderRangeMode } from './ChannelController.types';

export const COLORMAP_SLIDER_CHECKBOX_COLOR = [0, 177, 164];
export const MORPHOLOGY_KEYWORDS = ['nuclear', 'cytoplasmic'];
export const CHANNEL_MIN_FALLBACK = 0;
export const CHANNEL_MAX_FALLBACK = 65535;
export const CHANNEL_STEP = 1;
export const EXPANDED_RANGE_PADDING_RATIO = 0.15;

export const colormapToRgb = (on: boolean, colorArray: number[]) => {
  const color = on ? COLORMAP_SLIDER_CHECKBOX_COLOR : colorArray;
  return `rgb(${color})`;
};

export const calculateExpandedRange = (
  sliderMin: number,
  sliderMax: number,
  boundsMin: number = CHANNEL_MIN_FALLBACK,
  boundsMax: number = CHANNEL_MAX_FALLBACK
): [number, number] => {
  const range = sliderMax - sliderMin;
  const padding = Math.max(1, Math.round(range * EXPANDED_RANGE_PADDING_RATIO));
  const expandedMin = Math.max(boundsMin, sliderMin - padding);
  const expandedMax = Math.min(boundsMax, sliderMax + padding);
  return [expandedMin, expandedMax];
};

export const getVisibleRange = (
  mode: SliderRangeMode,
  [sliderMin, sliderMax]: [number, number],
  [domainMin, domainMax]: [number, number]
) => {
  const [min, max] =
    mode === 'contract' ? [domainMin, domainMax] : calculateExpandedRange(sliderMin, sliderMax, domainMin, domainMax);
  // Keep out-of-domain values on the track
  return { min: Math.min(min, sliderMin), max: Math.max(max, sliderMax) };
};

// Lowest-level stats underestimate the max, so prefer the metadata window
export const getWindowDomain = (window?: { min?: number; max?: number }): [number, number] | undefined =>
  typeof window?.min === 'number' && typeof window?.max === 'number'
    ? [Math.trunc(window.min), Math.trunc(window.max)]
    : undefined;

export const getPixelValueDisplay = (pixelValue: string, isLoading: boolean) => {
  if (isLoading) {
    return <CircularProgress size="50%" />;
  }

  if (pixelValue || typeof pixelValue === 'number') {
    return pixelValue;
  }
  return FILL_PIXEL_VALUE;
};
