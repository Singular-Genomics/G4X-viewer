export type GxFilterTableOptionsProps = {
  isFilterEnabled: boolean;
  isShowDiscardedEnabled: boolean;
  onToggleFilter: () => void;
  onToggleShowDiscarded: () => void;
  onClearFilters: () => void;
  clearDisabled?: boolean;
};
