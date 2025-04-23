import { ColorScale } from 'plotly.js';

export type CytometrySettingsMenuProps = {
  onBinSizeChange: (newBinSize: number) => void;
  onColorscaleChange: (colorscale: ColorScale) => void;
};

export type HeatmapSettings = {
  binSize?: number;
  colorscaleName?: string;
};

export type ColorScaleOption = {
  label: string;
  value: ColorScale;
};
