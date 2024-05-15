import { useShallow } from "zustand/react/shallow";
import { useLoader } from "../../../hooks/useLoader.hook";
import { useViewerStore } from "../../../stores/ViewerStore/ViewerStore";
import {
  colormapToRgb,
  getPixelValueDisplay,
} from "./ChannelController.helpers";
import { ChannelControllerProps } from "./ChannelController.types";
import { Grid, IconButton, MenuItem, Slider, Tooltip, Typography } from "@mui/material";
import { ChannelOptions } from "../ChannelOptions/ChannelOptions";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { truncateDecimalNumber } from "../../../legacy/utils";
import { GxSelect } from "../../../shared/components/GxSelect/GxSelect";
import { GxCheckbox } from "../../../shared/components/GxCheckbox";

export const ChannelController = ({
  color,
  domain,
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
  const loader = useLoader();
  const [colormap, channelOptions] = useViewerStore(
    useShallow((store) => [store.colormap, store.channelOptions])
  );
  const rgbColor = colormapToRgb(!!colormap, color);

  const [minValue, maxValue] = domain;
  const stepSize =
    maxValue - minValue < 500 &&
    (loader[0] === "Float32" || loader[0] === "Float64")
      ? (maxValue - minValue) / 500
      : 1;

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
          <Slider
            disabled={isLoading}
            value={slider}
            onChange={(_, newValue) =>
              handleSliderChange(
                Array.isArray(newValue) ? newValue : [newValue]
              )
            }
            valueLabelDisplay="auto"
            getAriaLabel={() => `${name}-${color}-${slider}`}
            valueLabelFormat={(v) => truncateDecimalNumber(v, 5)}
            min={minValue}
            max={maxValue}
            step={stepSize}
            orientation="horizontal"
            sx={sx.slider}
            style={{
              color: rgbColor,
              marginTop: "3px",
            }}
          />
        </Grid>
      </Grid>
    </Grid>
  );
};

const sx = {
  removeChannelButton: {
    "&:hover": {
      color: "rgba(0, 177, 164, 1)",
      backgroundColor: "unset",
    },
  },
  slider: {
    marginTop: "3px",
    "&.MuiSlider-root": {
      color: "rgba(0, 177, 164, 1)",
    },
    "& .MuiSlider-thumb:hover": {
      boxShadow: "0px 0px 0px 8px rgba(0, 177, 164, 0.3)",
    },
  },
  channelSelect: {
    width: '200px'
  }
};
