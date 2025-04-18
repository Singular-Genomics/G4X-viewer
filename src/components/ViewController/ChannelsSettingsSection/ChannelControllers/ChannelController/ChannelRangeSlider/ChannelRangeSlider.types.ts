export type ChannelRangeSliderProps = {
  slider: [number, number];
  color: [number, number, number];
  handleSliderChange: (newValue: [number, number]) => void;
  isLoading?: boolean;
};
