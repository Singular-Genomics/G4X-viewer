import { useShallow } from "zustand/react/shallow";
import { useViewerStore } from "../../../stores/ViewerStore";
import { Grid } from "@mui/material";
import { ScCheckbox } from "../../../shared/components/ScCheckbox";

export const MetadataLayerToggle = () => {
  const [isMetadataLayerOn, toggleMetadataLayer] = useViewerStore(
    useShallow((store) => [store.isMetadataLayerOn, store.toggleMetadataLayer])
  );

  return (
    <Grid
      container
      direction="row"
      justifyContent="flex-start"
      alignItems="center"
    >
      <Grid item xs={2}>
        <ScCheckbox
          onChange={toggleMetadataLayer}
          checked={isMetadataLayerOn}
          disableTouchRipple
        />
      </Grid>
      <Grid item>
        Metadata Layer
      </Grid>
    </Grid>
  );
};
