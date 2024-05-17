import { Grid } from "@mui/material";
import { GxCheckbox } from "../../../../shared/components/GxCheckbox";
import { useMetadataLayerStore } from "../../../../stores/MetadataLayerStore";
import { useShallow } from "zustand/react/shallow";

export const ExperimentalToggles = () => {
  const [
    showTilesBoundries,
    showTilesData,
    toggleTileBoundries,
    toggleTileData,
  ] = useMetadataLayerStore(
    useShallow((store) => [
      store.showTilesBoundries,
      store.showTilesData,
      store.toggleTileBoundries,
      store.toggleTileData,
    ])
  );

  return (
    <Grid container justifyContent="flex-start" alignItems="center">
      <Grid item xs={2}>
        <GxCheckbox 
          disableTouchRipple
          onChange={toggleTileBoundries}
          checked={showTilesBoundries} 
        />
      </Grid>
      <Grid item xs={10}>
        Show Tiles Boundries
      </Grid>
      <Grid item xs={2}>
        <GxCheckbox 
          disableTouchRipple 
          onChange={toggleTileData}
          checked={showTilesData}
        />
      </Grid>
      <Grid item xs={10}>
        Show Tiles Data
      </Grid>
    </Grid>
  );
};
