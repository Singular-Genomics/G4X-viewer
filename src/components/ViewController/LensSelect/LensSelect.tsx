import { Grid, MenuItem, Typography } from "@mui/material"
import { ScSelect } from "../../../shared/components/ScSelect/ScSelect"
import { useChannelsStore } from "../../../stores/ChannelsStore/ChannelsStore"
import { useViewerStore } from "../../../stores/ViewerStore/ViewerStore"
import { useShallow } from "zustand/react/shallow"
import { ScCheckbox } from "../../../shared/components/ScCheckbox"

export const LensSelect = () => {
  const selections = useChannelsStore((store) => store.selections)
  const [isLensOn, lensSelection, channelOptions, toggleLens] = useViewerStore(
    useShallow((store) => [
      store.isLensOn,
      store.lensSelection,
      store.channelOptions,
      store.toggleLens,
    ])
  )

  const currentChannelIndices = selections.map(sel => sel.c);

  return (
    <Grid
      container
      direction='row'
      justifyContent='flex-start'
      alignItems='center'
    >
      <Grid item xs={3}>
        Lens:
      </Grid>
      <Grid item xs={2}>
        <ScCheckbox
          onChange={toggleLens}
          checked={isLensOn}
          disableTouchRipple
        />
      </Grid>
      <Grid item xs={6}>
        <ScSelect
          value={lensSelection}
          fullWidth
          onChange={e =>
            useViewerStore.setState({ lensSelection: e.target.value as number })
          }
        >
          {currentChannelIndices.map((channelIndex, relativeIndex) => (
            <MenuItem
              key={channelOptions[channelIndex as number] + String(relativeIndex)}
              value={relativeIndex}
            >
              <Typography>{channelOptions[channelIndex as number]}</Typography>
            </MenuItem>
          ))}
        </ScSelect>
      </Grid>
    </Grid>
  )
}