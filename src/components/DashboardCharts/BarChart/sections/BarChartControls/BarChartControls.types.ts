import { SingleMask } from '../../../../../shared/types';

export type BarChartControlsProps = {
  selectedValue: string;
  selectedROIs: number[];
  selectedHue: BarChartHueValueOptions;
  selectedValueType: BarChartValueType;
  onRoiChange: (newRoiValues: number[]) => void;
  onValueChange: (newGeneValue: string) => void;
  onHueChange: (newHueValue: BarChartHueValueOptions) => void;
  onValueTypeChange: (newType: BarChartValueType) => void;
};

export type BarChartValueType = 'gene' | 'protein';

export type BarChartHueValueOptions = keyof Pick<SingleMask, 'clusterId'> | 'roi' | 'none';
