import { useShallow } from "zustand/react/shallow";
import { useViewerStore } from "../../../../stores/ViewerStore/ViewerStore";
import {
  colormapToRgb,
  getPixelValueDisplay,
} from "./ChannelController.helpers";
import { ChannelControllerProps } from "./ChannelController.types";
import { Grid, IconButton, MenuItem, Theme, Tooltip, Typography, useTheme } from "@mui/material";
import { ChannelOptions } from "../ChannelOptions/ChannelOptions";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { truncateDecimalNumber } from "../../../../legacy/utils";
import { GxSelect } from "../../../../shared/components/GxSelect/GxSelect";
import { GxCheckbox } from "../../../../shared/components/GxCheckbox";
import { GxSlider } from "../../../../shared/components/GxSlider";

export const ChannelController = ({
  color,
  name,
  isLoading,
  pixelValue,
  channelVisible,
  slider,
  toggleIsOn,
  onSelectionChange,
  handleColorSelect,
  handleRemoveChannel,
  handleSliderChange,
}: ChannelControllerProps) => {
  const theme = useTheme();
  const sx = styles(theme);

  const [colormap, channelOptions] = useViewerStore(
    useShallow((store) => [store.colormap, store.channelOptions])
  );
  const rgbColor = colormapToRgb(!!colormap, color);

  const minValue = 0;
  const maxValue = 65535;
  const stepSize = 500;

  return (
    <Grid container direction="column" justifyContent="center">
      <Grid
        container
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Grid item xs={10}>
          <GxSelect
            value={name}
            onChange={(e) => onSelectionChange(e.target.value as string)}
            sx={sx.channelSelect}
          >
            {channelOptions.map((opt) => (
              <MenuItem disabled={isLoading} key={opt} value={opt}>
                <Typography>{opt}</Typography>
              </MenuItem>
            ))}
          </GxSelect>
        </Grid>
        <Grid item xs={1}>
          <ChannelOptions
            handleColorSelect={handleColorSelect}
            disabled={isLoading}
          />
        </Grid>
        <Grid item xs={1}>
          <Tooltip title="Remove channel" arrow>
            <IconButton
              component="span"
              size="small"
              onClick={handleRemoveChannel}
              sx={sx.removeChannelButton}
            >
              <HighlightOffIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>
      <Grid
        container
        direction="row"
        justifyContent="flex-start"
        alignItems="center"
      >
        <Grid item xs={2}>
          {getPixelValueDisplay(pixelValue, isLoading)}
        </Grid>
        <Grid item xs={2}>
          <GxCheckbox
            onChange={toggleIsOn}
            disabled={isLoading}
            checked={channelVisible}
            disableTouchRipple
          />
        </Grid>
        <Grid item xs={7}>
          <GxSlider
            disabled={isLoading}
            value={slider}
            onChange={(_, newValue) =>
              handleSliderChange(
                Array.isArray(newValue) ? newValue : [newValue]
              )
            }
            valueLabelFormat={(v) => truncateDecimalNumber(v, 5)}
            min={minValue}
            max={maxValue}
            step={stepSize}
            orientation="horizontal"
            style={{color: rgbColor}}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};

const styles = (theme: Theme) => ({
  removeChannelButton: {
    "&:hover": {
      color: theme.palette.gx.accent.greenBlue,
      backgroundColor: "unset",
    },
  },
  channelSelect: {
    width: '200px'
  }
});
