export type ChannelControllerProps = {
  color: number[];
  name: string;
  isLoading: boolean;
  pixelValue: string;
  channelVisible: boolean;
  slider: number[];
  toggleIsOn: () => void;
  onSelectionChange: (newValue: string) => void;
  handleColorSelect: (newColor: number[]) => void;
  handleSliderChange: (newValue: number[]) => void;
  handleRemoveChannel: () => void;
};
