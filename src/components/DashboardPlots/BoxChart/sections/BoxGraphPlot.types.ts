import { BoxPlotData } from 'plotly.js';
import { BoxGraphValueType } from './BoxGraphControls.types';
import { BoxGraphSettingOptions } from './BoxGraphSettings.types';
import { BoxGraphHueValueOptions } from './BoxGraphControls.types';

export type BoxGraphPlotProps = {
  selectedROIs: number[];
  selectedValueType: BoxGraphValueType;
  selectedValue: string;
  selectedHue: BoxGraphHueValueOptions;
  settings: BoxGraphSettingOptions;
};

export type BoxGraphDataEntry = {
  x: (number | string)[];
  y: (number | string)[];
} & Partial<Omit<BoxPlotData, 'x' | 'y'>>;

export type BoxGraphOrientation = 'h' | 'v';
