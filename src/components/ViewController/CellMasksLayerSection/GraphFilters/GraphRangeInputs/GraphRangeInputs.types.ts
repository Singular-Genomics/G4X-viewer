import { UmapFilter } from '../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore.types';
import { HeatmapRanges } from '../../../../../stores/CytometryGraphStore/CytometryGraphStore.types';

export type GraphRangeInputsProps = {
  rangeSource: UmapFilter | HeatmapRanges | undefined;
  onUpdateRange: (newFilter: UmapFilter | HeatmapRanges) => void;
  onClear: () => void;
};

export type InputConfig = {
  field: InputFieldType;
  label: string;
  validateValue: (value: number, filter: UmapFilter | HeatmapRanges) => boolean;
  updateFilter: (value: number, filter: UmapFilter | HeatmapRanges) => any;
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
