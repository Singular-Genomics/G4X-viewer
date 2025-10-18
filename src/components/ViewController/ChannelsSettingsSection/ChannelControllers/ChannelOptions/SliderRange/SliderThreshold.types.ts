export type SliderThresholdProps = {
  slider: [number, number];
  rangeMin: number;
  rangeMax: number;
  setRangeMin: (value: number) => void;
  setRangeMax: (value: number) => void;
  setMinInputValue: (newVaule: string) => void;
  setMaxInputValue: (newVaule: string) => void;
  handleSliderChange: (newValue: [number, number]) => void;
};
