import { FormControlLabel, Grid, MenuItem, Typography } from "@mui/material";
import { GxSelect } from "../../../../shared/components/GxSelect/GxSelect";
import { useChannelsStore } from "../../../../stores/ChannelsStore/ChannelsStore";
import { useViewerStore } from "../../../../stores/ViewerStore/ViewerStore";
import { useShallow } from "zustand/react/shallow";
import { GxCheckbox } from "../../../../shared/components/GxCheckbox";

export const LensToggle = () => {
  const selections = useChannelsStore((store) => store.selections);
  const [isLensOn, lensSelection, channelOptions, toggleLens] = useViewerStore(
    useShallow((store) => [
      store.isLensOn,
      store.lensSelection,
      store.channelOptions,
      store.toggleLens,
    ])
  );

  const currentChannelIndices = selections.map((sel) => sel.c);

  return (
    <Grid
      container
      direction="row"
      justifyContent="flex-start"
      alignItems="center"
    >
      <Grid item xs={3}>
        <FormControlLabel
          label="Lens"
          control={
            <GxCheckbox
              onChange={toggleLens}
              checked={isLensOn}
              disableTouchRipple
            />
          }
        />
      </Grid>
      <Grid item xs={7}>
        {isLensOn && (
          <GxSelect
            value={lensSelection}
            fullWidth
            onChange={(e) =>
              useViewerStore.setState({
                lensSelection: e.target.value as number,
              })
            }
          >
            {currentChannelIndices.map((channelIndex, relativeIndex) => (
              <MenuItem
                key={
                  channelOptions[channelIndex as number] + String(relativeIndex)
                }
                value={relativeIndex}
              >
                <Typography>
                  {channelOptions[channelIndex as number]}
                </Typography>
              </MenuItem>
            ))}
          </GxSelect>
        )}
      </Grid>
    </Grid>
  );
};
