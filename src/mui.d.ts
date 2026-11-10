import { GxNavBarColors, GxPalette, GxSettingsPanelColors, GxViewportColors } from './themes/types';

declare module '@mui/material/styles' {
  interface CssThemeVariables {
    enabled: true;
  }

  interface Palette extends MuiPalette {
    gx: GxPalette;
    navBar: GxNavBarColors;
    settingsPanel: GxSettingsPanelColors;
    viewport: GxViewportColors;
  }

  interface PaletteOptions extends MuiPaletteOptions {
    gx: GxPalette;
    navBar?: GxNavBarColors;
    settingsPanel?: GxSettingsPanelColors;
    viewport?: GxViewportColors;
  }
  interface TypeBackground {
    level1: string;
    level2: string;
    level3: string;
  }
}

export {};
