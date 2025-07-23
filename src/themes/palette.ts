import { PaletteOptions } from '@mui/material';
import { GxPalette } from './types';

export const colors: GxPalette = {
  primary: {
    white: 'rgb(255, 255, 255)',
    black: 'rgb(0, 0, 0)'
  },
  lightGrey: {
    100: 'rgb(208, 208, 208)',
    300: 'rgb(215, 215, 215)',
    500: 'rgb(223, 223, 223)',
    700: 'rgb(231, 231, 231)',
    900: 'rgb(238, 238, 238)'
  },
  mediumGrey: {
    100: 'rgba(125, 127, 129, 1)',
    300: 'rgba(142, 144, 146, 1)',
    500: 'rgba(160, 161, 162, 1)',
    700: 'rgba(178, 178, 179, 1)',
    900: 'rgba(195, 195, 196, 1)'
  },
  darkGrey: {
    100: 'rgb(30, 30, 30)',
    300: 'rgb(46, 51, 55)',
    500: 'rgb(63, 68, 71)',
    700: 'rgb(81, 85, 88)',
    900: 'rgb(98, 102, 104)'
  },
  accent: {
    greenBlue: 'rgb(0, 177, 164)',
    darkGold: 'rgb(177, 146, 24)',
    error: 'rgb(255, 0, 0)',
    info: 'rgb(30, 103, 178)'
  },
  gradients: {
    default: (angle = 90) => `linear-gradient(${angle}deg, rgba(63,68,71,1) 0%, rgba(30,30,30,1) 100%)`,
    success: (angle = 90) => `linear-gradient(${angle}deg, rgba(67,160,71,1) 0%, rgba(46,113,49,1) 100%)`,
    warning: (angle = 90) => `linear-gradient(${angle}deg, rgba(251,202,0,1) 0%, rgba(177,128,0,1) 100%)`,
    danger: (angle = 90) => `linear-gradient(${angle}deg, rgba(251,0,0,1) 0%, rgba(135,0,0,1) 100%)`,
    info: (angle = 90) => `linear-gradient(${angle}deg, rgba(0,102,251,1) 0%, rgba(0,52,127,1) 100%)`,
    brand: (angle = 90) => `linear-gradient(${angle}deg, rgba(0,177,164,1) 0%, rgba(0,95,88,1) 100%)`
  }
};

export const gxColorPalette = {
  gx: colors
} as PaletteOptions;
