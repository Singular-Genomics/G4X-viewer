import { Box, FormControlLabel } from "@mui/material";
import { GxCheckbox } from "../../../../shared/components/GxCheckbox";
import { useTranscriptLayerStore } from "../../../../stores/TranscriptLayerStore";
import { useShallow } from "zustand/react/shallow";

export const ExperimentalToggles = () => {
  const [
    showTilesBoundries,
    showTilesData,
    toggleTileBoundries,
    toggleTileData,
  ] = useTranscriptLayerStore(
    useShallow((store) => [
      store.showTilesBoundries,
      store.showTilesData,
      store.toggleTileBoundries,
      store.toggleTileData,
    ])
  );

  return (
    <Box sx={sx.experimentalTogglesWrapper}>
      <FormControlLabel
        label="Show Tiles Boundries"
        control={
          <GxCheckbox
            disableTouchRipple
            onChange={toggleTileBoundries}
            checked={showTilesBoundries}
          />
        }
      />
      <FormControlLabel
        label="Show Tiles Data"
        control={
          <GxCheckbox
            disableTouchRipple
            onChange={toggleTileData}
            checked={showTilesData}
          />
        }
      />
    </Box>
  );
};

const sx = {
  experimentalTogglesWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    paddingLeft: "8px",
  },
};
