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
  proteinIndices: {
    xAxisIndex: -1,
    yAxisIndex: -1
  },
  ranges: undefined,
  settings: {
    graphMode: 'scattergl',
    pointSize: 2,
    subsamplingValue: 1,
    binCountX: 100,
    binCountY: 100,
    colorscale: { ...AVAILABLE_COLORSCALES[0], reversed: false },
    axisType: AVAILABLE_AXIS_TYPES[0],
    exponentFormat: AVAILABLE_EXPONENT_FORMATS[0]
  }
};

export const useCytometryGraphStore = create<CytometryGraphStore>()(
  persist(
    (set) => ({
      ...DEFAULT_VALUES,
      updateSettings: (newSettings) => set((state) => ({ ...state, settings: { ...state.settings, ...newSettings } })),
      updateProteinNames: (newNames) =>
        set((state) => ({ ...state, proteinIndices: { ...state.proteinIndices, ...newNames } })),
      updateRanges: (newRanges) => set((state) => ({ ...state, ranges: newRanges })),
      resetFilters: () =>
        set((state) => ({
          ...state,
          proteinIndices: {
            xAxisIndex: -1,
            yAxisIndex: -1
          },
          ranges: undefined
        }))
    }),
    {
      name: 'heatmapSettings',
      version: 1,
      partialize: (state) => ({ settings: state.settings })
    }
  )
);
