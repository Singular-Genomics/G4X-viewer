import { Box, FormControlLabel } from "@mui/material";
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
      <FormControlLabel
        label="Enable Filter"
        control={
          <GxSwitch
            disableTouchRipple
            onChange={toggleGeneNameFilter}
            checked={isGeneNameFilterActive}
          />
        }
      />
      <FormControlLabel
        label="Show Discarded"
        control={
          <GxSwitch
            disableTouchRipple
            onChange={toggleShowFilteredPoints}
            checked={showFilteredPoints}
            disabled={!isGeneNameFilterActive}
          />
        }
      />
    </Box>
  );
};

const sx = {
  optionsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    paddingLeft: "8px",
    marginBottom: "8px",
  },
};
