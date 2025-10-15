import { BoxPlotData } from 'plotly.js';
import { BoxGraphValueType, HueValueOptions } from './BoxGraphControls.types';

export type BoxGraphPlotProps = {
  selectedROIs: number[];
  selectedValueType: BoxGraphValueType;
  selectedValue: string;
  selectedHue: HueValueOptions;
  orientation?: BoxGraphOrientation;
};

export type BoxGraphDataEntry = {
  x: (number | string)[];
  y: (number | string)[];
} & Partial<Omit<BoxPlotData, 'x' | 'y'>>;

export type BoxGraphOrientation = 'horizontal' | 'vertical';
