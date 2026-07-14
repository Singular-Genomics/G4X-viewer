export type SliderRangeMode = 'contract' | 'expanded';

export type ChannelControllerProps = {
  color: [number, number, number];
  defaultColor: [number, number, number];
  domain: [number, number];
  name: string;
  isLoading: boolean;
  pixelValue: string;
  channelVisible: boolean;
  slider: [number, number];
  defaultSlider: [number, number];
  toggleIsOn: () => void;
  onSelectionChange: (newValue: string) => void;
  handleColorSelect: (newColor: [number, number, number]) => void;
  handleSliderChange: (newValue: [number, number]) => void;
  handleResetSlider: () => void;
  handleRemoveChannel: () => void;
  isSoloed: boolean;
  isSoloMode: boolean;
  presoloVisible: boolean;
  onSoloToggle: () => void;
  toggleSelectInSoloMode: () => void;
};
