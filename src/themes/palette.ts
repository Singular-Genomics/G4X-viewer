import { PaletteOptions } from '@mui/material';
import { GxPalette } from './types';

// Neutral greys in 5% sRGB steps, with named black and white endpoints.
const neutrals = {
  black: '#000000',
  5: '#0D0D0D',
  10: '#1A1A1A',
  15: '#262626',
  20: '#333333',
  25: '#404040',
  30: '#4D4D4D',
  35: '#595959',
  40: '#666666',
  45: '#737373',
  50: '#808080',
  55: '#8C8C8C',
  60: '#999999',
  65: '#A6A6A6',
  70: '#B3B3B3',
  75: '#C0C0C0',
  80: '#CCCCCC',
  85: '#D9D9D9',
  90: '#E6E6E6',
  95: '#F2F2F2',
  white: '#FFFFFF'
};

const pures = {
  black: neutrals.black,
  white: neutrals.white,
  red: '#FF0000',
  green: '#00FF00',
  blue: '#0000FF',
  yellow: '#FFFF00',
  cyan: '#00FFFF',
  magenta: '#FF00FF'
};

// Brand colors follow the SG reference's HEX labels.
const blues = {
  200: '#182F3E',
  400: '#123F5D',
  600: '#0C507D',
  800: '#06609C',
  main: '#0071BC'
};

const blueGreens = {
  200: '#01557c', // This one is not in the SG reference's HEX labels. Was added manually.
  400: '#007EB7',
  600: '#008BB2',
  800: '#0097AE',
  main: '#00B1A4'
};

const greens = {
  200: '#184137',
  400: '#12644F',
  600: '#0C8668',
  800: '#06A980',
  main: '#00CC99'
};

const accents = {
  green: greens.main,
  greenBlue: blueGreens.main,
  blue: blues.main,
  purple: '#A661FF',
  magenta: '#DA54A4',
  red: '#F45959',
  redDark: '#CB4A4A',
  orange: '#F28622',
  yellow: '#FFB800'
};

const messages = {
  error: accents.red,
  info: blues.main,
  success: greens.main,
  warning: accents.orange
};

const gradient =
  (start: string, end: string) =>
  (angle = 90) =>
    `linear-gradient(${angle}deg, ${start} 0%, ${end} 100%)`;

// Mode-invariant brand colors. Mode-aware roles (background/text/divider)
// live in lightPalette/darkPalette below, not here.
export const colors: GxPalette = {
  neutrals,
  pures,
  blues,
  blueGreens,
  greens,
  accent: accents,
  message: messages,
  gradients: {
    brand: gradient(blues.main, accents.purple),
    default: gradient(neutrals[25], neutrals[10])
  }
};

// MUI's required color roles, separate from UI element assignments.
const muiColorRoles = {
  primary: { main: greens[400], light: pures.magenta, dark: blues[600] },
  secondary: { main: accents.purple }
};

// Shared UI element assignments, applied in both light and dark mode.
const commonPalette = {
  gx: colors,
  ...muiColorRoles,
  sectionDivider: neutrals[25],
  background: {
    viewport: neutrals[5]
  }
};

export const lightPalette: PaletteOptions = {
  ...commonPalette,
  mode: 'light',
  background: {
    ...commonPalette.background,
    topBar: neutrals.white,
    settingsPanel: neutrals[80],
    default: neutrals[80],
    paper: neutrals.white
  },
  layerToggle: {
    thumb: neutrals[10],
    backgroundOn: muiColorRoles.primary.main,
    backgroundOff: neutrals[80]
  },
  text: { primary: neutrals[10], secondary: neutrals[35] },
  divider: neutrals[65]
};

export const darkPalette: PaletteOptions = {
  ...commonPalette,
  mode: 'dark',
  background: {
    ...commonPalette.background,
    topBar: blues[200],
    settingsPanel: neutrals[10],
    default: neutrals[10],
    paper: neutrals[20]
  },
  layerToggle: {
    thumb: neutrals[75],
    backgroundOn: muiColorRoles.primary.main,
    backgroundOff: neutrals[10]
  },
  text: { primary: neutrals[75], secondary: neutrals[60] },
  divider: neutrals[65]
};
