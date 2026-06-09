import { create } from 'zustand';
import { ChannelsStore, ChannelsStoreValues } from './ChannelsStore.types';

export const DEFAULT_CHANNEL_COLOR: [number, number, number] = [255, 255, 255];
export const DEFAULT_CHANNEL_CONTRAST: [number, number] = [0, 65535];

const DEFAUlT_CHANNEL_VALUES = {
  channelsVisible: [true],
  contrastLimits: [[0, 65535]],
  colors: [[255, 255, 255]],
  domains: [[0, 65535]],
  selections: { z: 0, c: 0, t: 0 },
  ids: ''
};

const DEFAULT_CHANNEL_STORE_STATE: ChannelsStoreValues = {
  channelsVisible: [true],
  isLayerVisible: true,
  contrastLimits: [[0, 65535]],
  colors: [[255, 255, 255]],
  domains: [[0, 65535]],
  selections: [{ z: 0, c: 0, t: 0 }],
  ids: [''],
  image: 0,
  loader: [{ labels: [], shape: [] }],
  channelsSettings: {},
  channelSelectionMode: 'multiselect',
  soloChannelIndex: null,
  presoloChannelsVisible: [],
  loadedColors: [],
  loadedContrastLimits: [],
  loadedChannelsVisible: []
};

export const useChannelsStore = create<ChannelsStore>((set, get) => ({
  ...DEFAULT_CHANNEL_STORE_STATE,
  toggleIsOn: (index) =>
    set((store) => {
      const channelsVisible = [...store.channelsVisible];

      if (store.channelSelectionMode === 'radio') {
        channelsVisible.fill(false);
        channelsVisible[index] = true;
      } else {
        channelsVisible[index] = !channelsVisible[index];
      }

      return { ...store, channelsVisible };
    }),
  toggleLayerVisibility: () =>
    set((store) => ({
      ...store,
      isLayerVisible: !store.isLayerVisible
    })),
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
          newState[key] = store[key as keyof ChannelsStoreValues].filter((_: any, index: number) => index !== channel);
        }
      });
      return { ...store, ...newState, soloChannelIndex: null, presoloChannelsVisible: [] };
    }),
  addChannel: (newChannelProperties) => {
    set((store) => {
      const entries = Object.entries(newChannelProperties);
      const newStore: any = { ...store };
      entries.forEach(([property, value]) => {
        newStore[property] = [...(store as any)[property], value];
      });
      Object.entries(DEFAUlT_CHANNEL_VALUES).forEach(([key, value]) => {
        if (newStore[key].length < newStore[entries[0][0]].length) {
          newStore[key] = [...(store as any)[key], value];
        }
      });
      return newStore;
    });
  },
  getLoader: () => {
    const { loader, image } = get();
    return Array.isArray(loader[0]) ? loader[image] : loader;
  },
  setChannelSelectionMode: (mode) =>
    set((store) => {
      const newState = { ...store, channelSelectionMode: mode };

      if (mode === 'radio') {
        const firstVisibleIndex = store.channelsVisible.findIndex((visible) => visible);
        if (firstVisibleIndex !== -1) {
          const channelsVisible = [...store.channelsVisible];
          channelsVisible.fill(false);
          channelsVisible[firstVisibleIndex] = true;
          newState.channelsVisible = channelsVisible;
        }
      }

      return newState;
    }),
  setSoloChannel: (index) =>
    set((store) => {
      if (store.soloChannelIndex === index) {
        return {
          ...store,
          channelsVisible: [...store.presoloChannelsVisible],
          soloChannelIndex: null,
          presoloChannelsVisible: []
        };
      }

      const channelsVisible = store.channelsVisible.map((_, i) => i === index);

      if (store.soloChannelIndex === null) {
        return {
          ...store,
          presoloChannelsVisible: [...store.channelsVisible],
          soloChannelIndex: index,
          channelsVisible
        };
      }

      return { ...store, soloChannelIndex: index, channelsVisible };
    }),
  togglePresoloIsOn: (index) =>
    set((store) => {
      const presoloChannelsVisible = [...store.presoloChannelsVisible];
      presoloChannelsVisible[index] = !presoloChannelsVisible[index];
      return { ...store, presoloChannelsVisible };
    }),
  setLoadedChannelDefaults: (colors, contrastLimits, channelsVisible) =>
    set((store) => ({
      ...store,
      loadedColors: colors,
      loadedContrastLimits: contrastLimits,
      loadedChannelsVisible: channelsVisible
    }))
}));
