import { PlotData } from 'plotly.js';
import { BarChartValueType, BarChartHueValueOptions } from '../BarChartControls';
import { BarChartSettingOptions } from '../BarChartSettings';

export type BarChartPlotProps = {
  selectedROIs: number[];
  selectedValueType: BarChartValueType;
  selectedValue: string;
  selectedHue: BarChartHueValueOptions;
  settings: BarChartSettingOptions;
};

export type BarChartDataEntry = {
  x: (number | string)[];
  y: (number | string)[];
} & Partial<Omit<PlotData, 'x' | 'y'>>;

export type BarChartOrientation = 'h' | 'v';
