export type ChannelOptionsProps = {
  color: [number, number, number];
  defaultColor: [number, number, number];
  slider: [number, number];
  domain: [number, number];
  disabled: boolean;
  handleColorSelect: (newColor: number[]) => void;
  rangeMin: string;
  rangeMax: string;
  setRangeMin: (value: string) => void;
  setRangeMax: (value: string) => void;
  setMinInputValue: (newVaule: string) => void;
  setMaxInputValue: (newVaule: string) => void;
  handleSliderChange: (newValue: [number, number]) => void;
};
