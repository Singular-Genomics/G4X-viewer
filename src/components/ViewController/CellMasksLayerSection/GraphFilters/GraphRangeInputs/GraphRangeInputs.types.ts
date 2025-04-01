import {
  CytometryFilter,
  UmapFilter,
} from "../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore.types";

export type GraphRangeInputsProps = {
  rangeSource: UmapFilter | CytometryFilter | undefined;
  onUpdateRange: (newFilter: UmapFilter | CytometryFilter) => void;
  onClear: () => void;
};

export type InputConfig = {
  field: InputFieldType;
  label: string;
  validateValue: (
    value: number,
    filter: UmapFilter | CytometryFilter
  ) => boolean;
  updateFilter: (value: number, filter: UmapFilter | CytometryFilter) => any;
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

export type InputFieldType = "xStart" | "xEnd" | "yStart" | "yEnd";
