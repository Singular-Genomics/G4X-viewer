export interface GxPalette {
  primary: GxPrimaryColor;
  darkGrey: GxTonalGreyColor;
  mediumGrey: GxTonalGreyColor;
  lightGrey: GxTonalGreyColor;
  accent: GxAccentColor;
  gradients: GxGradients;
}

export interface GxPrimaryColor {
  white: string;
  black: string;
}

export interface GxTonalGreyColor {
  100: string;
  300: string;
  500: string;
  700: string;
  900: string;
}

export interface GxAccentColor {
  greenBlue: string;
  darkGold: string;
  error: string;
  info: string;
}

export interface GxGradients {
  default: (angle?: number) => string;
  warning: (angle?: number) => string;
  danger: (angle?: number) => string;
  info: (angle?: number) => string;
  success: (angle?: number) => string;
  brand: (angle?: number) => string;
}
