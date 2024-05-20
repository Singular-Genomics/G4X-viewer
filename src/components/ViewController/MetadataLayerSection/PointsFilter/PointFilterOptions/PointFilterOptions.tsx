import { Box, Typography } from "@mui/material";
import { GxSwitch } from "../../../../../shared/components/GxSwitch";
import { useMetadataLayerStore } from "../../../../../stores/MetadataLayerStore";
import { useShallow } from "zustand/react/shallow";

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
    <Box sx={sx.optionsContainer}>
      <Box sx={sx.switchWrapper}>
        <GxSwitch
          disableTouchRipple
          onChange={toggleGeneNameFilter}
          checked={isGeneNameFilterActive}
        />
        <Typography>Enable Filter</Typography>
      </Box>
      <Box sx={sx.switchWrapper}>
        <GxSwitch
          disableTouchRipple
          onChange={toggleShowFilteredPoints}
          checked={showFilteredPoints}
          disabled={!isGeneNameFilterActive}
        />
        <Typography>Show Discarded</Typography>
      </Box>
    </Box>
  );
};

const sx = {
  optionsContainer: {
    display: "flex",
    flexDirection: "column",
    marginBottom: "8px",
  },
  switchWrapper: {
    display: "flex",
    flexDirection: "row",
    columnGap: "16px",
    alignItems: "center",
  },
};
