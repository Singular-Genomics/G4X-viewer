import { Grid } from "@mui/material"
import { useViewerStore } from "../../../stores/ViewerStore/ViewerStore"
import { useShallow } from "zustand/react/shallow"
import { ScCheckbox } from "../../../shared/components/ScCheckbox"


export const OverviewSelect = () => {
  const [
    isOverviewOn,
    toggleOverview
  ] = useViewerStore(
    useShallow((store) => [
      store.isOverviewOn,
      store.toggleOverview
    ])
  )

  return (
    <Grid
      container
      direction='row'
      justifyContent='flex-start'
      alignItems='center'
    >
      <Grid item xs={3}>
        Overview
      </Grid>
      <Grid item xs={2}>
        <ScCheckbox
          onChange={toggleOverview}
          checked={isOverviewOn}
          disableTouchRipple
        />
      </Grid>
    </Grid>
  )
}