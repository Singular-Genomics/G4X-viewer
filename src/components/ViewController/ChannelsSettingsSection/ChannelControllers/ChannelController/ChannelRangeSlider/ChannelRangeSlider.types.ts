export type ChannelRangeSliderProps = {
  slider: [number, number];
  color: [number, number, number];
  handleSliderChange: (newValue: [number, number]) => void;
  isLoading?: boolean;
  visibleMin: number;
  visibleMax: number;
  minInputValue: string;
  maxInputValue: string;
  setMinInputValue: (newVaule: string) => void;
  setMaxInputValue: (newVaule: string) => void;
};
