export interface GxPalette {
  primary: GxPrimaryColor;
  darkGrey: GxTonalGreyColor;
  mediumGrey: GxTonalGreyColor;
  lightGrey: GxTonalGreyColor;
  blue: GxTonalColor & { main: string };
  blueGreen: GxTonalColor;
  green: GxTonalColor & { main: string };
  accent: GxAccentColor;
  gradients: GxGradients;
}

export interface GxPrimaryColor {
  white: string;
  black: string;
  greyDark: string;
  greyMedium: string;
  greyLight: string;
  greyExtraLight: string;
}

export interface GxTonalGreyColor {
  100: string;
  300: string;
  500: string;
  700: string;
  900: string;
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
  /** @deprecated Use yellow. */
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
  blueGreen: (angle?: number) => string;
  purpleBlue: (angle?: number) => string;
}
