export type ChannelRangeSliderProps = {
  slider: [number, number];
  color: [number, number, number];
  handleSliderChange: (newValue: [number, number]) => void;
  isLoading?: boolean;
  rangeMin: number;
  rangeMax: number;
  minInputValue: string;
  maxInputValue: string;
  setMinInputValue: (newVaule: string) => void;
  setMaxInputValue: (newVaule: string) => void;
};
