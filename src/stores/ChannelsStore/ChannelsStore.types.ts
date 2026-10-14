import { SelectionsType } from '../../components/PictureInPictureViewerAdapter/PictureInPictureViewerAdapter.types';

export type ChannelsStore = ChannelsStoreValues & ChannelsStoreMethods;

export type ChannelSelectionMode = 'multiselect' | 'radio';

export type ChannelsStoreValues = {
  contrastLimits: [number, number][];
  colors: [number, number, number][];
  channelsVisible: boolean[];
  isLayerVisible: boolean;
  channelsSettings: ChannelsSettings;
  selections: SelectionsType[];
  ids: string[];
  image: number;
  loader: any; // <- This is quite complicated
  domains: number[][];
  channelSelectionMode: ChannelSelectionMode;
  soloChannelIndex: number | null;
  presoloChannelsVisible: boolean[];
  loadedColors: [number, number, number][];
  loadedContrastLimits: [number, number][];
  loadedChannelsVisible: boolean[];
  loadedSelections: number[];
};

export type ChannelsStoreMethods = {
  toggleIsOn: (index: number) => void;
  toggleLayerVisibility: () => void;
  setPropertiesForChannel: (channel: number, newProperties: Partial<PropertiesUpdateType>) => void;
  removeChannel: (channel: number) => void;
  addChannel: (newChannelProperties: ChannelsStoreValues) => void;
  getLoader: () => any;
  setChannelSelectionMode: (mode: ChannelSelectionMode) => void;
  setSoloChannel: (index: number) => void;
  togglePresoloIsOn: (index: number) => void;
  setLoadedChannelDefaults: (
    colors: [number, number, number][],
    contrastLimits: [number, number][],
    channelsVisible: boolean[],
    selections: number[]
  ) => void;
};

export type PropertiesUpdateType = {
  contrastLimits?: [number, number];
  colors?: [number, number, number];
  domains?: number[];
  selections?: SelectionsType;
  channelsVisible?: boolean;
};

export type ChannelsStoreChannelsProperties = Omit<
  ChannelsStoreValues,
  'ids' | 'image' | 'loader' | 'selections' | 'channelsVisible'
>;

export type ChannelsSettings = {
  [name: string]: ChannelSettings;
};

export type ChannelSettings = {
  color?: [number, number, number];
  maxValue?: number;
  minValue?: number;
  initialContrastLimits?: [number, number];
  initialColor?: [number, number, number];
};
