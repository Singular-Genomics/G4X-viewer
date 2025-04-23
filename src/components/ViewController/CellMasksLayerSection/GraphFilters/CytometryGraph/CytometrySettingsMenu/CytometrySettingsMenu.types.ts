import { ColorScale } from 'plotly.js';

export type CytometrySettingsMenuProps = {
  onBinSizeChange?: (newBinSize: number) => void;
  onColorscaleChange?: (colorscale: ColorScale) => void;
};
