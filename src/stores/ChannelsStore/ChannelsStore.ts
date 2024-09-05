import { create } from "zustand";
import { ChannelsStore, ChannelsStoreValues } from "./ChannelsStore.types";

const DEFAUlT_CHANNEL_VALUES = {
  channelsVisible: [true],
  contrastLimits: [[0, 65535]],
  colors: [[255, 255, 255]],
  domains: [[0, 65535]],
  selections: [{ z: 0, c: 0, t: 0 }],
  ids: "",
};

const DEFAULT_CHANNEL_STORE_STATE: ChannelsStoreValues = {
  channelsVisible: [true],
  contrastLimits: [[0, 65535]],
  colors: [[255, 255, 255]],
  domains: [[0, 65535]],
  selections: [{ z: 0, c: 0, t: 0 }],
  ids: [""],
  image: 0,
  loader: [{ labels: [], shape: [] }],
  channelsSettings: {},
};

export const useChannelsStore = create<ChannelsStore>((set) => ({
  ...DEFAULT_CHANNEL_STORE_STATE,
  toggleIsOn: (index) =>
    set((store) => {
      const channelsVisible = [...store.channelsVisible];
      channelsVisible[index] = !channelsVisible[index];
      return { ...store, channelsVisible };
    }),
  setPropertiesForChannel: (channel, newProperties) =>
    set((store) => {
      const entries = Object.entries(newProperties);
      const newStore: any = {};
      entries.forEach(([property, value]) => {
        newStore[property] = [...store[property as keyof ChannelsStoreValues]];
        newStore[property][channel] = value;
      });
      return { ...store, ...newStore };
    }),
  removeChannel: (channel) =>
    set((store) => {
      const newState: any = {};
      const channelKeys = Object.keys(DEFAUlT_CHANNEL_VALUES);
      Object.keys(store).forEach((key) => {
        if (channelKeys.includes(key)) {
          newState[key] = store[key as keyof ChannelsStoreValues].filter(
            (_: any, index: number) => index !== channel
          );
        }
      });
      return { ...store, ...newState };
    }),
  addChannel: (newChannelProperties) => {
    set((store) => {
      const entries = Object.entries(newChannelProperties);
      const newStore = { ...store };
      entries.forEach(([property, value]) => {
        newStore[property as keyof ChannelsStore] = [
          ...store[property as keyof ChannelsStore],
          value,
        ];
      });
      Object.entries(DEFAUlT_CHANNEL_VALUES).forEach(([key, value]) => {
        if (
          newStore[key as keyof ChannelsStore].length <
          newStore[entries[0][0] as keyof ChannelsStore].length
        ) {
          newStore[key as keyof ChannelsStore] = [
            ...store[key as keyof ChannelsStore],
            value,
          ];
        }
      });
      return newStore;
    });
  },
}));
