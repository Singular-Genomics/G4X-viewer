export type ChannelOptionsProps = {
  slider: [number, number];
  disabled: boolean;
  handleColorSelect: (newColor: number[]) => void;
  rangeMin: number;
  rangeMax: number;
  setRangeMin: (value: number) => void;
  setRangeMax: (value: number) => void;
  setMinInputValue: (newVaule: string) => void;
  setMaxInputValue: (newVaule: string) => void;
  handleSliderChange: (newValue: [number, number]) => void;
};
