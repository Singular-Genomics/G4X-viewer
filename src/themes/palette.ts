import { GxPalette } from "./types";
import createPalette, { PaletteOptions } from "@mui/material/styles/createPalette";

export const colors: GxPalette = {
  primary: {
    white: 'rgb(255, 255, 255)',
    black: 'rgb(0, 0, 0)',
  },
  lightGrey: {
    100: 'rgb(208, 208, 208)',
    300: 'rgb(215, 215, 215)',
    500: 'rgb(223, 223, 223)',
    700: 'rgb(231, 231, 231)',
    900: 'rgb(238, 238, 238)',
  },
  mediumGrey: {
    100: 'rgba(125, 127, 129, 1)',
    300: 'rgba(142, 144, 146, 1)',
    500: 'rgba(160, 161, 162, 1)',
    700: 'rgba(178, 178, 179, 1)',
    900: 'rgba(195, 195, 196, 1)',
  },
  darkGrey: {
    100: 'rgb(30, 30, 30)',
    300: 'rgb(46, 51, 55)',
    500: 'rgb(63, 68, 71)',
    700: 'rgb(81, 85, 88)',
    900: 'rgb(98, 102, 104)',
  },
  accent: {
    greenBlue: 'rgb(0, 177, 164)',
    darkGold: 'rgb(177, 146, 24)',
  }
}

export const gxColorPalette = createPalette({
  gx: colors,
} as PaletteOptions);