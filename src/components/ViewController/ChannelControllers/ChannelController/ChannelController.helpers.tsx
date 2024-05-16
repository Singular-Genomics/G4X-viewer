import { CircularProgress } from "@mui/material";
import { FILL_PIXEL_VALUE } from "../../../../shared/constants";
import { truncateDecimalNumber } from "../../../../legacy/utils";

export const COLORMAP_SLIDER_CHECKBOX_COLOR = [0, 177, 164];

export const colormapToRgb = (on: boolean, colorArray: number[]) => {
  const color = on ? COLORMAP_SLIDER_CHECKBOX_COLOR : colorArray;
  return `rgb(${color})`;
}

export const getPixelValueDisplay = (pixelValue: string, isLoading: boolean) => {
  if (isLoading) {
    return <CircularProgress size="50%" />;
  }
  // Need to check if it's a number becaue 0 is falsy.
  if (pixelValue || typeof pixelValue === 'number') {
    return truncateDecimalNumber(pixelValue, 7);
  }
  return FILL_PIXEL_VALUE;
};