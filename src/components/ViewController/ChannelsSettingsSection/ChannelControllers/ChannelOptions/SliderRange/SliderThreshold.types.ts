export type SliderThresholdProps = {
  slider: [number, number];
  rangeMin: string;
  rangeMax: string;
  setRangeMin: (value: string) => void;
  setRangeMax: (value: string) => void;
  setMinInputValue: (newVaule: string) => void;
  setMaxInputValue: (newVaule: string) => void;
  handleSliderChange: (newValue: [number, number]) => void;
};
