import { Box, Grid, Slider, Theme, Typography, alpha, useTheme } from "@mui/material";
import { useLoader } from "../../../../hooks/useLoader.hook";
import { GLOBAL_SLIDER_DIMENSION_FIELDS, getMultiSelectionStats, range } from "../../../../legacy/utils";
import { useViewerStore } from "../../../../stores/ViewerStore/ViewerStore";
import { useChannelsStore } from "../../../../stores/ChannelsStore/ChannelsStore";
import { useShallow } from "zustand/react/shallow";
import { unstable_batchedUpdates } from "react-dom";
import { PropertiesUpdateType } from "../../../../stores/ChannelsStore/ChannelsStore.types";
import { debounce } from "lodash";

export const GlobalSelectionSliders = () => {
  const theme = useTheme();
  const sx = styles(theme);

  const loader = useLoader();
  const globalSelection = useViewerStore(store => store.globalSelection);
  const [selections, setPropertiesForChannel] = useChannelsStore(
    useShallow((store) => [store.selections, store.setPropertiesForChannel])
  )

  const { shape, labels } = loader[0];

  const globalControlLabels = labels.filter((label: any) =>
    GLOBAL_SLIDER_DIMENSION_FIELDS.includes(label)
  );

  const changeSelection = debounce(
    (_event, newValue, label) => {
      useViewerStore.setState({
        isChannelLoading: selections.map(() => true)
      });
      const newSelections = [...selections].map((selection) => ({
        ...selection,
        [label]: newValue,
      }));

      // ---->> This can be updated if 3D view won't ever be used
      getMultiSelectionStats({
        loader,
        selections: newSelections,
      }).then(({ domains, contrastLimits}) => {
        unstable_batchedUpdates(() => {
          range(newSelections.length).forEach((channel, j) => 
            setPropertiesForChannel(channel, {
              domains: domains[j],
              contrastLimits: contrastLimits[j]
            } as PropertiesUpdateType)
          )
        });
        unstable_batchedUpdates(() => {
          useViewerStore.setState({
            onViewportLoad: () => {
              useViewerStore.setState({
                onViewportLoad: () => {},
                isChannelLoading: selections.map(() => false)
              });
            }
          });
          range(newSelections.length).forEach((channel, j) =>
            setPropertiesForChannel(channel, {
              selections: newSelections[j],
            } as PropertiesUpdateType)
          );
        });
      });
    },
    50,
    { leading: true }
  )

  return (
    <Box>
      {globalControlLabels.length ? globalControlLabels.map((label: any) => {
        const size = shape[labels.indexOf(label)];

        return (
          <Grid
            key={label}
            container
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item xs={1}>
              <Typography sx={sx.selectionLabel}>{label}</Typography>
            </Grid>
            <Grid item xs sx={sx.sliderContainer}>
              <Slider
                value={globalSelection[label]}
                onChange={(event, newValue) => {
                  useViewerStore.setState({
                    globalSelection: {
                      ...globalSelection,
                      [label]: newValue,
                    }
                  })
                  if (event.type === 'keydown') {
                    changeSelection(event, newValue, label);
                  }
                }}
                onChangeCommitted={(event, newValue) => changeSelection(event, newValue, label)}
                size="small"
                valueLabelDisplay="auto"
                step={1}
                min={0}
                max={size - 1}
                sx={sx.slider}
                disabled
              />
            </Grid>
          </Grid>
        );
      }) : (
        <Box>
          <Typography textAlign="center">No global selection data</Typography>
        </Box>
      )}
    </Box>
  );
};

const styles = (theme: Theme) => ({
  selectionLabel: {
    textTransform: 'uppercase',
    marginLeft: '8px',
  },
  sliderContainer: {
    padding: "0px 16px",
  },
  slider: {
    "&.MuiSlider-root": {
      color: theme.palette.gx.accent.greenBlue,
    },
    "&.Mui-disabled": {
      color: theme.palette.gx.darkGrey[700],
      opacity: 0.75,
    },
    "& .MuiSlider-thumb:hover": {
      boxShadow: `0px 0px 0px 8px ${alpha(theme.palette.gx.accent.greenBlue, 0.3)}`,
    }
  },
});
