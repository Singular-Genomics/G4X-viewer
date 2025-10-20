import { SingleMask } from '../../../../../shared/types';

export type BoxChartControlsProps = {
  selectedValue: string;
  selectedROIs: number[];
  selectedHue: BoxChartHueValueOptions;
  selectedValueType: BoxChartValueType;
  onRoiChange: (newRoiValues: number[]) => void;
  onValueChange: (newGeneValue: string) => void;
  onHueChange: (newHueValue: BoxChartHueValueOptions) => void;
  onValueTypeChange: (newType: BoxChartValueType) => void;
};

export type BoxChartValueType = 'gene' | 'protein';

export type BoxChartHueValueOptions = keyof Pick<SingleMask, 'clusterId'> | 'roi' | 'none';
