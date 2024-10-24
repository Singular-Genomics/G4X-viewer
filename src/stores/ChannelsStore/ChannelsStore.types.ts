import { SelectionsType } from "../../components/PictureInPictureViewerAdapter/PictureInPictureViewerAdapter.types";

export type ChannelsStore = ChannelsStoreValues & ChannelsStoreMethods;

export type ChannelsStoreValues = {
  contrastLimits: number[][];
  colors: number[][];
  channelsVisible: boolean[];
  channelsSettings: ChannelsSettings;
  selections: SelectionsType[];
  ids: string[];
  image: number;
  loader: any; // <- This is quite complicated
  domains: number[][];
};

export type ChannelsStoreMethods = {
  toggleIsOn: (index: number) => void;
  setPropertiesForChannel: (
    channel: number,
    newProperties: Partial<PropertiesUpdateType>
  ) => void;
  removeChannel: (channel: number) => void;
  addChannel: (newChannelProperties: ChannelsStoreValues) => void;
  getLoader: () => any;
};

export type PropertiesUpdateType = {
  contrastLimits?: number[];
  colors?: number[];
  domains?: number[];
  selections?: SelectionsType;
  channelsVisible?: boolean;
};

export type ChannelsStoreChannelsProperties = Omit<
  ChannelsStoreValues,
  "ids" | "image" | "loader" | "selections" | "channelsVisible"
>;

export type ChannelsSettings = {
  [name: string]: ChannelSettings;
};

export type ChannelSettings = {
  color?: number[];
  maxValue?: number;
  minValue?: number;
};
