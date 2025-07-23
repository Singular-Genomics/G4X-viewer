import { create } from 'zustand';
import { UmapGraphStore, UmapGraphStoreValues } from './UmapGraphStore.types';
import { persist } from 'zustand/middleware';

const DEFAULT_VALUES: UmapGraphStoreValues = {
  ranges: undefined,
  settings: {
    pointSize: 1,
    subsamplingValue: 1
  }
};

export const useUmapGraphStore = create<UmapGraphStore>()(
  persist(
    (set) => ({
      ...DEFAULT_VALUES,
      resetFilters: () => set((state) => ({ ...state, ranges: undefined })),
      updateSettings: (newSettings) => set((state) => ({ ...state, settings: { ...state.settings, ...newSettings } }))
    }),
    {
      name: 'umapSettings',
      partialize: (state) => ({ settings: state.settings })
    }
  )
);
