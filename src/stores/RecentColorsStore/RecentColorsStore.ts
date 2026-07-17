import { create } from 'zustand';
import { COLOR_PALLETE } from '../../shared/constants';
import { RecentColorsStore, RecentColorsStoreValues } from './RecentColorsStore.types';

const MAX_RECENT_COLORS = COLOR_PALLETE.length;

const DEFAULT_VALUES: RecentColorsStoreValues = {
  recentColors: [...COLOR_PALLETE]
};

export const useRecentColorsStore = create<RecentColorsStore>((set, get) => ({
  ...DEFAULT_VALUES,
  addRecentColor: (rgb) => {
    const { recentColors } = get();
    const withoutDuplicate = recentColors.filter(([r, g, b]) => r !== rgb[0] || g !== rgb[1] || b !== rgb[2]);
    set({ recentColors: [rgb, ...withoutDuplicate].slice(0, MAX_RECENT_COLORS) });
  }
}));
