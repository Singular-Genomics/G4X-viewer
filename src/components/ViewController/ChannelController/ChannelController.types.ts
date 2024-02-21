export type ChannelControllerProps = {
  color: number[];
  domain: number[];
  name: string;
  isLoading: boolean;
  pixelValue: string;
  channelVisible: boolean;
  slider: any; // <--- Adjust this
  toggleIsOn: () => void;
  onSelectionChange: (newValue: string) => void;
  handleColorSelect: (newColor: number[]) => void;
  handleSliderChange: (newValue: number[]) => void;
  handleRemoveChannel: () => void;
}