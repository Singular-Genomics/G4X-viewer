import { create } from "zustand";
import { ViewerStore, ViewerStoreValues } from "./ViewerStore.types";

const DEFAULT_VIEWER_STORE_STATE: ViewerStoreValues = {
  isChannelLoading: [],
  isViewerLoading: false,
  isOverviewOn: true,
  isLensOn: false,
  useColorMap: false,
  colormap: "",
  globalSelection: { c: 0, t: 0, z: 0 },
  lensSelection: 0,
  pixelValues: [],
  hoverCoordinates: { x: "", y: "" },
  channelOptions: [],
  metadata: null,
  source: null,
  pyramidResolution: 0,
  viewportWidth: 0,
  viewportHeight: 0,
  viewState: null,
};

export const useViewerStore = create<ViewerStore>((set) => ({
  ...DEFAULT_VIEWER_STORE_STATE,
  reset: () => set({ ...DEFAULT_VIEWER_STORE_STATE }),
  toggleOverview: () => set((store) => ({ isOverviewOn: !store.isOverviewOn })),
  toggleLens: () => set((store) => ({ isLensOn: !store.isLensOn })),
  onViewportLoad: () => {},
  setIsChannelLoading: (index: number, val: boolean) =>
    set((state) => {
      const newIsChannelLoading = [...state.isChannelLoading];
      newIsChannelLoading[index] = val;
      return { ...state, isChannelLoading: newIsChannelLoading };
    }),
  addIsChannelLoading: (val: boolean) =>
    set((state) => {
      const newIsChannelLoading = [...state.isChannelLoading, val];
      return { ...state, isChannelLoading: newIsChannelLoading };
    }),
  removeIsChannelLoading: (index: number) =>
    set((state) => {
      const newIsChannelLoading = [...state.isChannelLoading];
      newIsChannelLoading.splice(index, 1);
      return { ...state, isChannelLoading: newIsChannelLoading };
    }),
}));
