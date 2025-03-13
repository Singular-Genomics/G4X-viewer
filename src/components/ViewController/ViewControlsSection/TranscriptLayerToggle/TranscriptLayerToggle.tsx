import { useShallow } from "zustand/react/shallow";
import { Box, FormControlLabel } from "@mui/material";
import { GxCheckbox } from "../../../../shared/components/GxCheckbox";
import { useTranscriptLayerStore } from "../../../../stores/TranscriptLayerStore";


export const TranscriptLayerToggle = () => {
  const [isTranscriptLayerOn, showTilesBoundries, toggleTranscriptLayer, toggleTileBoundries] = useTranscriptLayerStore(
    useShallow((store) => [
      store.isTranscriptLayerOn,
      store.showTilesBoundries,
      store.toggleTranscriptLayer,
      store.toggleTileBoundries,
    ])
  );

  return (
    <>
      <Box>
        <FormControlLabel
          label="Transcript Layer"
          control={
            <GxCheckbox
              onChange={toggleTranscriptLayer}
              checked={isTranscriptLayerOn}
              disableTouchRipple
            />
          }
        />
        <FormControlLabel
          label="Show Tile Boundaries"
          control={
            <GxCheckbox
              disableTouchRipple
              onChange={toggleTileBoundries}
              checked={showTilesBoundries}
            />
          }
        />
      </Box>
    </>
  );
};
