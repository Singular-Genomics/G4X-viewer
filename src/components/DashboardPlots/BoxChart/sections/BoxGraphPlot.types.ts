import { BoxPlotData } from 'plotly.js';
import { BoxGraphValueType, HueValueOptions } from './BoxGraphControls.types';
import { BoxGraphSettingOptions } from './BoxGraphSettings.types';

export type BoxGraphPlotProps = {
  selectedROIs: number[];
  selectedValueType: BoxGraphValueType;
  selectedValue: string;
  selectedHue: HueValueOptions;
  settings: BoxGraphSettingOptions;
};

export type BoxGraphDataEntry = {
  x: (number | string)[];
  y: (number | string)[];
} & Partial<Omit<BoxPlotData, 'x' | 'y'>>;

export type BoxGraphOrientation = 'h' | 'v';
