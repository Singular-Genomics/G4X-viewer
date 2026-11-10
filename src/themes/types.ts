export interface GxPalette {
  neutrals: GxNeutralColors;
  pures: GxPureColor;
  blues: GxTonalColor;
  blueGreens: GxTonalColor;
  greens: GxTonalColor & { main: string };
  accent: GxAccentColor;
  message: GxMessageColor;
  gradients: GxGradients;
}

export interface GxNeutralColors extends Record<
  5 | 10 | 15 | 20 | 25 | 30 | 35 | 40 | 45 | 50 | 55 | 60 | 65 | 70 | 75 | 80 | 85 | 90 | 95,
  string
> {
  white: string;
  black: string;
}

export interface GxTonalColor {
  200: string;
  400: string;
  600: string;
  800: string;
}

export interface GxAccentColor {
  purple: string;
  magenta: string;
  red: string;
  redDark: string;
  orange: string;
  yellow: string;
  greenBlue: string;
}

export interface GxPureColor {
  red: string;
  green: string;
  blue: string;
  yellow: string;
  cyan: string;
  magenta: string;
}

export interface GxMessageColor {
  error: string;
  info: string;
  success: string;
  warning: string;
}

export interface GxGradients {
  brand: (angle?: number) => string;
  default: (angle?: number) => string;
}

export interface GxLayerToggleColors {
  thumb: string;
  backgroundOn: string;
  backgroundOff: string;
}

export interface GxNavBarColors {
  surface: string;
  text: string;
  secondaryText: string;
  selectedBackground: string;
  hoverBackground: string;
}

export interface GxSettingsPanelColors {
  surface: string;

  sections: {
    background: string;
    divider: string;
  };
  layerToggle: GxLayerToggleColors;
  toggleButton: {
    background: string;
    text: string;
    activeBackground: string;
    activeText: string;
    hoverBackground: string;
    activeHoverBackground: string;
  };
}

export interface GxViewportColors {
  surface: string;
  tools: {
    background: string;
    activeBackground: string;
    text: string;
  };
  tooltip: {
    background: string;
    text: string;
    border: string;
  };
  status: {
    background: string;
    text: string;
  };
}
