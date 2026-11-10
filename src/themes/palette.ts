import { alpha, PaletteOptions } from '@mui/material';
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
// live in defaultPalette/altPalette below, not here.
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

// Complete dark palette. All app-specific assignments are defined here.
export const defaultPalette = {
  mode: 'dark',
  gx: colors,

  primary: { main: greens[400], light: pures.magenta, dark: greens[200] },
  secondary: { main: accents.purple },

  background: {
    default: neutrals[10],
    paper: neutrals[20],
    level1: neutrals[15],
    level2: neutrals[20],
    level3: neutrals[25]
  },

  text: { primary: neutrals[75], secondary: neutrals[60] },

  navBar: {
    surface: blues[200],
    text: neutrals[75],
    secondaryText: neutrals[60],
    selectedBackground: alpha(neutrals.white, 0.16),
    hoverBackground: alpha(neutrals.white, 0.08)
  },

  settingsPanel: {
    surface: neutrals[10],
    sections: {
      background: accents.purple,
      divider: neutrals[65]
    },

    layerToggle: {
      thumb: neutrals[80],
      backgroundOn: greens[400],
      backgroundOff: neutrals[10]
    }
  },

  viewport: {
    surface: neutrals[5],
    tools: {
      background: neutrals[15],
      activeBackground: greens[200],
      text: neutrals[65]
    },
    tooltip: {
      background: neutrals[10],
      text: neutrals[75],
      border: neutrals[65]
    },
    status: { background: neutrals[10], text: neutrals[75] }
  }
} satisfies PaletteOptions;

// Light adjustments only. Spread each nested group before overriding its fields
// so new default assignments are inherited automatically.
export const altPalette = {
  ...defaultPalette,
  mode: 'light',

  background: {
    default: neutrals[15],
    paper: neutrals[20],
    level1: neutrals[70],
    level2: neutrals[85],
    level3: neutrals[90]
  },

  text: { primary: neutrals[10], secondary: neutrals[25] },

  settingsPanel: {
    ...defaultPalette.settingsPanel,
    surface: neutrals[80],
    sections: {
      background: accents.purple,
      divider: neutrals[65]
    },
    layerToggle: {
      ...defaultPalette.settingsPanel.layerToggle,
      backgroundOff: neutrals[60]
    }
  }
} satisfies PaletteOptions;
