import { create } from "zustand";
import { TooltipStore, TooltipStoreValues } from "./TooltipStore.types";

const DEFAULT_VALUES: TooltipStoreValues = {
  position: { x: 0, y: 0 },
  visible: false,
};

export const useTooltipStore = create<TooltipStore>(() => ({
  ...DEFAULT_VALUES,
}));
