export type ChannelOptionsProps = {
  disabled: boolean;
  handleColorSelect: (newColor: number[]) => void;
  rangeMin: number;
  rangeMax: number;
  setRangeMin: (value: number) => void;
  setRangeMax: (value: number) => void;
  setMinInputValue: (newVaule: string) => void;
  setMaxInputValue: (newVaule: string) => void;
};
