import { Box, FormControlLabel, Grid, Input, Theme, useTheme } from "@mui/material";
import { useCellSegmentationLayerStore } from "../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore";
import { useShallow } from "zustand/react/shallow";
import { GxSwitch } from "../../../../shared/components/GxSwitch";
import { GxSlider } from "../../../../shared/components/GxSlider";

const MIN_FILL_OPACITY = 1;
const MAX_FILL_OPACITY = 100;
const FILL_OPACITY_STEP = 1;

export const CellMasksFillSettings = () => {
  const theme = useTheme();
  const sx = styles(theme);

  const [isCellFillOn, cellFillOpacity, toggleCellFill, setCellFillOpacity] =
    useCellSegmentationLayerStore(
      useShallow((store) => [
        store.isCellFillOn,
        store.cellFillOpacity,
        store.toggleCellFill,
        store.setCellFillOpacity,
      ])
    );

  const handleChange = (event: any) => {
    let inputValue = event.target.value;
    inputValue = inputValue.replace(",", ".");

    if (inputValue === "") {
      setCellFillOpacity(MIN_FILL_OPACITY);
      return;
    }

    if (/^\d*\.?\d{0,1}$/.test(inputValue)) {
      let newValue = parseFloat(inputValue);

      if (newValue > MAX_FILL_OPACITY) {
        newValue = MAX_FILL_OPACITY;
      } else if (newValue < MIN_FILL_OPACITY) {
        newValue = MIN_FILL_OPACITY;
      }

      setCellFillOpacity(+(newValue / 100).toFixed(2));
    }
  };

  return (
    <Box sx={sx.strokeSettingsContainer}>
      <FormControlLabel
        label="Show cell fill"
        sx={sx.toggleSwitch}
        control={
          <GxSwitch
            disableTouchRipple
            onChange={toggleCellFill}
            checked={isCellFillOn}
          />
        }
      />
      <Grid
        container
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={sx.sliderInputContainer}
      >
        <Grid item xs={1}>
          <Input
            value={(cellFillOpacity * 100)}
            size="small"
            onChange={handleChange}
            type="number"
            inputProps={{
              step: FILL_OPACITY_STEP.toString(),
              max: MAX_FILL_OPACITY.toString(),
              min: MIN_FILL_OPACITY.toString(),
            }}
            sx={sx.textField}
            disabled={!isCellFillOn}
          />
        </Grid>
        <Grid item xs sx={sx.sliderInputItem}>
          <GxSlider
            value={cellFillOpacity * 100}
            onChange={(_, newValue) => {
              const value = Array.isArray(newValue) ? newValue[0] : newValue
              setCellFillOpacity(+(value / 100).toFixed(2));
            }}
            valueLabelFormat={(value: number) => `${Math.round(value)}%`}
            step={0.1}
            min={MIN_FILL_OPACITY}
            max={MAX_FILL_OPACITY}
            disabled={!isCellFillOn}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  strokeSettingsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "8px",
  },
  toggleSwitch: {
    paddingLeft: "8px",
  },
  sliderInputContainer: {
    paddingLeft: "8px",
  },
  sliderInputItem: {
    padding: "0px 8px 0px 16px",
  },
  textField: {
    marginBottom: "8px",
    "& .MuiFormLabel-root.Mui-focused": {
      color: theme.palette.gx.accent.greenBlue,
    },
    "&.MuiInputBase-root::after": {
      borderBottom: "2px solid",
      borderColor: theme.palette.gx.accent.greenBlue,
    },
    "& .MuiInputBase-input": {
      textAlign: "center",
    },
    "& .MuiInputBase-input::-webkit-outer-spin-button, & .MuiInputBase-input::-webkit-inner-spin-button":
      {
        WebkitAppearance: "none",
        margin: 0,
      },
    "& .MuiInputBase-input[type=number]": {
      MozAppearance: "textfield",
    },
  },
});
