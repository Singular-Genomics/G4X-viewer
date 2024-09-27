export type ChannelRangeSliderProps = {
  slider: number[];
  color: number[];
  handleSliderChange: (newValue: number[]) => void;
  isLoading?: boolean;
};
