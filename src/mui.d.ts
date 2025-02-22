import { GxPalette } from './themes/types';

declare module '@mui/material/styles' {
  interface Palette extends MuiPalette {
    gx: GxPalette;
  }

  interface PaletteOptions extends MuiPaletteOptions {
    gx: GxPalette;
  }
}

export {};
