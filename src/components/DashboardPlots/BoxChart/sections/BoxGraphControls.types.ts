import { SingleMask } from '../../../../shared/types';

export type BoxGraphControlsProps = {
  selectedValue: string;
  selectedROIs: number[];
  selectedHue: HueValueOptions;
  selectedValueType: BoxGraphValueType;
  onRoiChange: (newRoiValues: number[]) => void;
  onValueChange: (newGeneValue: string) => void;
  onHueChange: (newHueValue: HueValueOptions) => void;
  onValueTypeChange: (newType: BoxGraphValueType) => void;
};

export type BoxGraphValueType = 'gene' | 'protein';

export type HueValueOptions = keyof Pick<SingleMask, 'clusterId'> | 'roi' | 'none';
