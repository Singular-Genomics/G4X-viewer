import { Grid } from "@mui/material";
import { useViewerStore } from "../../../../stores/ViewerStore/ViewerStore";
import { useShallow } from "zustand/react/shallow";
import { GxCheckbox } from "../../../../shared/components/GxCheckbox";

export const OverviewToggle = () => {
  const [isOverviewOn, toggleOverview] = useViewerStore(
    useShallow((store) => [store.isOverviewOn, store.toggleOverview])
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
          onChange={toggleOverview}
          checked={isOverviewOn}
          disableTouchRipple
        />
      </Grid>
      <Grid item>
        Overview
      </Grid>
    </Grid>
  );
};
