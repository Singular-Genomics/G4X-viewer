import { GxPalette } from './themes/types';

declare module '@mui/material/styles' {
  interface CssThemeVariables {
    enabled: true;
  }

  interface TypeBackground {
    topBar: string;
    settingsPanel: string;
    viewport: string;
  }

  interface Palette extends MuiPalette {
    gx: GxPalette;
    sectionDivider: string;
  }

  interface PaletteOptions extends MuiPaletteOptions {
    gx: GxPalette;
    sectionDivider?: string;
  }
}

export {};
