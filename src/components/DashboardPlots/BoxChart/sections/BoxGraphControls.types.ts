import { SingleMask } from '../../../../shared/types';

export type BoxGraphControlsProps = {
  selectedGene: string;
  selectedROIs: number[];
  selectedHue: HueValueOptions;
  onRoiChange: (newRoiValues: number[]) => void;
  onGeneChange: (newGeneValue: string) => void;
  onHueChange: (newHueValue: HueValueOptions) => void;
};

export type HueValueOptions = keyof Pick<SingleMask, 'clusterId'> | 'roi' | 'none';
