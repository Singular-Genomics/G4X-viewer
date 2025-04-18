export type ChannelControllerProps = {
  color: [number, number, number];
  name: string;
  isLoading: boolean;
  pixelValue: string;
  channelVisible: boolean;
  slider: [number, number];
  toggleIsOn: () => void;
  onSelectionChange: (newValue: string) => void;
  handleColorSelect: (newColor: [number, number, number]) => void;
  handleSliderChange: (newValue: [number, number]) => void;
  handleRemoveChannel: () => void;
};
