import { PlotData } from 'plotly.js';
import { HeatmapChartValueType } from '../HeatmapChartControls';
import { HeatmapChartSettingOptions } from '../HeatmapChartSettings';

export type HeatmapChartPlotProps = {
  selectedROIs: number[];
  selectedValueType: HeatmapChartValueType;
  selectedValues: string[];
  settings: HeatmapChartSettingOptions;
};

export type HeatmapChartDataEntry = {
  z: number[][];
  x?: (number | string)[];
  y?: (number | string)[];
} & Partial<Omit<PlotData, 'x' | 'y' | 'z'>>;

export type HeatmapChartConfig = {
  zMin: number;
  zMax: number;
};

export type ParseCellsByRoiParams = {
  rois: number[];
  valueType: HeatmapChartValueType;
  selectedValues: string[];
  settings: HeatmapChartSettingOptions;
  upperThreshold?: number;
  lowerThreshold?: number;
};
