import { useMetadataLayerStore } from "../../../../../stores/MetadataLayerStore";
import { useShallow } from "zustand/react/shallow";
import { GxFilterTableOptions } from "../../../../../shared/components/GxFilterTable/GxFilterTableOptions";

export const PointFilterOptions = () => {
  const [
    isGeneNameFilterActive,
    showFilteredPoints,
    toggleGeneNameFilter,
    toggleShowFilteredPoints,
  ] = useMetadataLayerStore(
    useShallow((store) => [
      store.isGeneNameFilterActive,
      store.showFilteredPoints,
      store.toggleGeneNameFilter,
      store.toggleShowFilteredPoints,
    ])
  );

  return (
    <GxFilterTableOptions
      isFilterEnabled={isGeneNameFilterActive}
      isShowDiscardedEnabled={showFilteredPoints}
      onToggleFilter={toggleGeneNameFilter}
      onToggleShowDiscarded={toggleShowFilteredPoints}
    />
  );
};