import { useShallow } from "zustand/react/shallow";
import { Grid } from "@mui/material";
import { GxCheckbox } from "../../../../shared/components/GxCheckbox";
import { useMetadataLayerStore } from "../../../../stores/MetadataLayerStore";

export const MetadataLayerToggle = () => {
  const [isMetadataLayerOn, toggleMetadataLayer] = useMetadataLayerStore(
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
        <GxCheckbox
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
