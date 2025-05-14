import { create } from 'zustand';
import {
  AVAILABLE_AXIS_TYPES,
  AVAILABLE_COLORSCALES,
  AVAILABLE_EXPONENT_FORMATS,
  CytometryGraphStore,
  CytometryGraphStoreValues
} from './CytometryGraphStore.types';
import { persist } from 'zustand/middleware';

const DEFAULT_VALUES: CytometryGraphStoreValues = {
  proteinNames: {},
  ranges: undefined,
  settings: {
    binSize: 100,
    colorscale: AVAILABLE_COLORSCALES[0],
    axisType: AVAILABLE_AXIS_TYPES[0].value,
    exponentFormat: AVAILABLE_EXPONENT_FORMATS[0].value
  }
};

export const useCytometryGraphStore = create<CytometryGraphStore>()(
  persist(
    (set) => ({
      ...DEFAULT_VALUES,
      updateSettings: (newSettings) => set((state) => ({ ...state, settings: { ...state.settings, ...newSettings } })),
      updateProteinNames: (newNames) =>
        set((state) => ({ ...state, proteinNames: { ...state.proteinNames, ...newNames } })),
      updateRanges: (newRanges) => set((state) => ({ ...state, ranges: newRanges })),
      resetFilters: () => set((state) => ({ ...state, proteinNames: {}, ranges: undefined }))
    }),
    {
      name: 'heatmapSettings',
      partialize: (state) => ({ settings: state.settings })
    }
  )
);
