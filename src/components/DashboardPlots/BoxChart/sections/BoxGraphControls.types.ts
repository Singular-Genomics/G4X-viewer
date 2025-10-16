import { SingleMask } from '../../../../shared/types';

export type BoxGraphControlsProps = {
  selectedValue: string;
  selectedROIs: number[];
  selectedHue: BoxGraphHueValueOptions;
  selectedValueType: BoxGraphValueType;
  onRoiChange: (newRoiValues: number[]) => void;
  onValueChange: (newGeneValue: string) => void;
  onHueChange: (newHueValue: BoxGraphHueValueOptions) => void;
  onValueTypeChange: (newType: BoxGraphValueType) => void;
};

export type BoxGraphValueType = 'gene' | 'protein';

export type BoxGraphHueValueOptions = keyof Pick<SingleMask, 'clusterId'> | 'roi' | 'none';
