import { Box, Input, Theme, useTheme } from "@mui/material";
import { GxSlider } from "../../../../../shared/components/GxSlider";
import { colormapToRgb } from "../ChannelController.helpers";
import { truncateDecimalNumber } from "../../../../../legacy/utils";
import { ChannelRangeSliderProps } from "./ChannelRangeSlider.types";
import { useViewerStore } from "../../../../../stores/ViewerStore";
import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react";
import { debounce } from "lodash";

const CHANNEL_MIN = 0;
const CHANNEL_MAX = 65535;
const CHANNEL_STEP = 1;
const DEBOUNCE_TIME_MS = 300;

export const ChannelRangeSlider = ({
  color,
  slider,
  handleSliderChange,
  isLoading,
}: ChannelRangeSliderProps) => {
  const theme = useTheme();
  const sx = styles(theme);
  const [minInputValue, setMinInputValue] = useState<string>("");
  const [maxInputValue, setMaxInputValue] = useState<string>("");

  const [currentMinValue, currentMaxValue] = slider;

  useEffect(() => {
    setMinInputValue(currentMinValue.toString());
    setMaxInputValue(currentMaxValue.toString());
  }, [currentMaxValue, currentMinValue]);

  const colormap = useViewerStore((store) => store.colormap);
  const rgbColor = colormapToRgb(!!colormap, color);

  const debouncedMinInputChange = useMemo(
    () =>
      debounce((currentValue: string) => {
        if (currentValue === "") return;
        const newValue =
          +currentValue >= currentMaxValue
            ? currentMaxValue
            : +currentValue < CHANNEL_MIN
            ? CHANNEL_MIN
            : +currentValue;
        setMinInputValue(newValue.toString());
        handleSliderChange([newValue, currentMaxValue]);
      }, DEBOUNCE_TIME_MS),
    [currentMaxValue, handleSliderChange]
  );

  const handleMinInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setMinInputValue(e.target.value);
      debouncedMinInputChange(e.target.value);
    },
    [debouncedMinInputChange]
  );

  const debouncedMaxInputChange = useMemo(
    () =>
      debounce((currentValue: string) => {
        if (currentValue === "") return;
        const newValue =
          +currentValue <= currentMinValue
            ? currentMinValue
            : +currentValue > CHANNEL_MAX
            ? CHANNEL_MAX
            : +currentValue;
        setMaxInputValue(newValue.toString());
        handleSliderChange([currentMinValue, newValue]);
      }, DEBOUNCE_TIME_MS),
    [currentMinValue, handleSliderChange]
  );

  const handleMaxInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setMaxInputValue(e.target.value);
      debouncedMaxInputChange(e.target.value);
    },
    [debouncedMaxInputChange]
  );

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "24px",
        paddingRight: "16px",
      }}
    >
      <Input
        id="channel_min"
        type="number"
        sx={sx.textField}
        value={minInputValue}
        onChange={handleMinInputChange}
        inputProps={{
          max: CHANNEL_MAX,
          step: CHANNEL_STEP,
        }}
      />
      <GxSlider
        disabled={isLoading}
        value={slider}
        onChange={(_, newValue) =>
          handleSliderChange(Array.isArray(newValue) ? newValue : [newValue])
        }
        valueLabelFormat={(v) => truncateDecimalNumber(v, 5)}
        min={CHANNEL_MIN}
        max={CHANNEL_MAX}
        step={CHANNEL_STEP}
        orientation="horizontal"
        style={{ color: rgbColor }}
      />
      <Input
        id="channel_max"
        type="number"
        sx={sx.textField}
        value={maxInputValue}
        onChange={handleMaxInputChange}
        inputProps={{
          max: CHANNEL_MAX,
          step: CHANNEL_STEP,
        }}
      />
    </Box>
  );
};

const styles = (theme: Theme) => ({
  textField: {
    marginBottom: "8px",
    minWidth: "60px",
    "& .MuiFormLabel-root.Mui-focused": {
      color: theme.palette.gx.accent.greenBlue,
    },
    "&.MuiInputBase-input": {
      cursor: "auto",
    },
    "&.MuiInputBase-root::after": {
      borderBottom: "2px solid",
      borderColor: theme.palette.gx.accent.greenBlue,
    },
  },
});
