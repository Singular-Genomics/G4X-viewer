import { create } from 'zustand';
import { UmapGraphStore, UmapGraphStoreValues } from './UmapGraphStore.types';
import { persist } from 'zustand/middleware';

const DEFAULT_VALUES: UmapGraphStoreValues = {
  ranges: undefined,
  settings: {
    pointSize: 1,
    subsamplingValue: 0
  }
};

export const useUmapGraphStore = create<UmapGraphStore>()(
  persist(
    () => ({
      ...DEFAULT_VALUES
    }),
    {
      name: 'umapSettings',
      partialize: (state) => ({ settings: state.settings })
    }
  )
);
