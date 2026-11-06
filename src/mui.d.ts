import { GxPalette } from './themes/types';

declare module '@mui/material/styles' {
  interface CssThemeVariables {
    enabled: true;
  }

  interface TypeBackground {
    settingsPanel: string;
    viewport: string;
  }

  interface Palette extends MuiPalette {
    gx: GxPalette;
  }

  interface PaletteOptions extends MuiPaletteOptions {
    gx: GxPalette;
  }
}

export {};
