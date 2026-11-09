import { GxLayerToggleColors, GxPalette } from './themes/types';

declare module '@mui/material/styles' {
  interface CssThemeVariables {
    enabled: true;
  }

  interface TypeBackground {
    topBar: string;
    settingsPanel: string;
    viewport: string;
    viewportTools: string;
    viewportToolTip: string;
  }

  interface Palette extends MuiPalette {
    gx: GxPalette;
    sectionDivider: string;
    layerToggle: GxLayerToggleColors;
  }

  interface PaletteOptions extends MuiPaletteOptions {
    gx: GxPalette;
    sectionDivider?: string;
    layerToggle?: GxLayerToggleColors;
  }
}

export {};
