import { BoxPlotData } from 'plotly.js';
import { BoxChartValueType } from '../BoxChartControls/BoxChartControls.types';
import { BoxChartSettingOptions } from '../BoxChartSettings/BoxChartSettings.types';
import { BoxChartHueValueOptions } from '../BoxChartControls/BoxChartControls.types';

export type BoxChartPlotProps = {
  selectedROIs: number[];
  selectedValueType: BoxChartValueType;
  selectedValue: string;
  selectedHue: BoxChartHueValueOptions;
  settings: BoxChartSettingOptions;
};

export type BoxChartDataEntry = {
  x: (number | string)[];
  y: (number | string)[];
} & Partial<Omit<BoxPlotData, 'x' | 'y'>>;

export type BoxChartOrientation = 'h' | 'v';
