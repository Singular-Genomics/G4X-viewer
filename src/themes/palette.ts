import { PaletteOptions } from '@mui/material';
import { GxPalette } from './types';

// SG colors: use the reference's HEX labels as the source of truth.
const primary = {
  white: '#FFFFFF',
  black: '#000000',
  greyDark: '#1E1E1E',
  greyMedium: '#CCCCCC',
  greyLight: '#F2F2F2',
  greyExtraLight: '#F8F8F8'
};

const darkGrey = {
  100: '#212426',
  300: '#2E3337',
  500: '#3F4447',
  700: '#515558',
  900: '#626668'
};

const blue = {
  200: '#182F3E',
  400: '#123F5D',
  600: '#0C507D',
  800: '#06609C',
  main: '#0071BC'
};

const blueGreen = {
  200: '#007EB7',
  400: '#008BB2',
  600: '#0097AE',
  800: '#00B1A4'
};

const green = {
  200: '#184137',
  400: '#12644F',
  600: '#0C8668',
  800: '#06A980',
  main: '#00CC99'
};

const accents = {
  purple: '#A661FF',
  magenta: '#DA54A4',
  red: '#F45959',
  redDark: '#CB4A4A',
  orange: '#F28622',
  yellow: '#FFB800'
};

const gradient =
  (start: string, end: string) =>
  (angle = 90) =>
    `linear-gradient(${angle}deg, ${start} 0%, ${end} 100%)`;

export const colors: GxPalette = {
  primary,
  lightGrey: {
    100: '#D0D0D0',
    300: '#D7D7D7',
    500: '#DFDFDF',
    700: '#E7E7E7',
    900: '#EEEEEE'
  },
  mediumGrey: {
    100: '#7D7F81',
    300: '#8E9092',
    500: '#A0A1A2',
    700: '#B2B2B3',
    900: '#C3C3C4'
  },
  darkGrey,
  blue,
  blueGreen,
  green,
  accent: {
    ...accents,
    greenBlue: blueGreen[800],
    darkGold: accents.yellow,
    error: accents.red,
    info: blue.main
  },
  gradients: {
    default: gradient(darkGrey[500], primary.greyDark),
    success: gradient(green.main, green[600]),
    warning: gradient(accents.yellow, accents.orange),
    danger: gradient(accents.red, accents.redDark),
    info: gradient(blue.main, blue[600]),
    brand: gradient(blue.main, green.main),
    blueGreen: gradient(blueGreen[200], blueGreen[800]),
    // The purple sample has no HEX label for its blue endpoint; use SG Blue.
    purpleBlue: gradient(accents.purple, blue.main)
  }
};

export const gxColorPalette: PaletteOptions = {
  gx: colors,
  primary: { main: blueGreen[800], light: green.main, dark: green[600] },
  secondary: { main: accents.purple },
  success: { main: green.main, light: green.main, dark: green[600] },
  warning: { main: accents.orange, light: accents.yellow, dark: accents.orange },
  error: { main: accents.red, light: accents.red, dark: accents.redDark },
  info: { main: blue.main, light: blue.main, dark: blue[600] }
};
