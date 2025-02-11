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
  warning: string;
  danger: string;
  info: string;
  brand: string;
}
