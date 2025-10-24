export type GxColorPickerProps = {
  color: ColorHsv;
  handleColorChange: (color: ColorHsv) => void;
  handleConfirm: () => void;
};

export type ColorHex = string;

export type ColorRgb = {
  r: number;
  g: number;
  b: number;
};

export type ColorHsv = {
  h: number;
  s: number;
  v: number;
};
