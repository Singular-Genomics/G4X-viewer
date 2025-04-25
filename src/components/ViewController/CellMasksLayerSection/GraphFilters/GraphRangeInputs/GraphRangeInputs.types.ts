import { HeatmapRanges } from '../../../../../stores/CytometryGraphStore/CytometryGraphStore.types';
import { UmapRange } from '../../../../../stores/UmapGraphStore/UmapGraphStore.types';

export type GraphRangeInputsProps = {
  rangeSource: UmapRange | HeatmapRanges | undefined;
  inputPrecission?: number;
  onUpdateRange: (newFilter: UmapRange | HeatmapRanges) => void;
  onClear: () => void;
  onConfirm: () => void;
};

export type InputConfig = {
  field: InputFieldType;
  label: string;
  validateValue: (value: number, filter: UmapRange | HeatmapRanges) => boolean;
  updateFilter: (value: number, filter: UmapRange | HeatmapRanges) => any;
};

export type InputRange = {
  xStart: string;
  xEnd: string;
  yStart: string;
  yEnd: string;
};

export type InputErrors = {
  xStart?: boolean;
  xEnd?: boolean;
  yStart?: boolean;
  yEnd?: boolean;
};

export type InputFieldType = 'xStart' | 'xEnd' | 'yStart' | 'yEnd';
