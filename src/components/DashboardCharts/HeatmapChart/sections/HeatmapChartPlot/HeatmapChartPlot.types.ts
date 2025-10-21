import { PlotData } from 'plotly.js';
import { HeatmapChartValueType } from '../HeatmapChartControls';
import { HeatmapChartSettingOptions } from '../HeatmapChartSettings';

export type HeatmapChartPlotProps = {
  selectedROIs: number[];
  selectedValueType: HeatmapChartValueType;
  selectedValue: string;
  settings: HeatmapChartSettingOptions;
};

export type HeatmapChartDataEntry = {
  z: number[][];
  x?: (number | string)[];
  y?: (number | string)[];
} & Partial<Omit<PlotData, 'x' | 'y' | 'z'>>;
