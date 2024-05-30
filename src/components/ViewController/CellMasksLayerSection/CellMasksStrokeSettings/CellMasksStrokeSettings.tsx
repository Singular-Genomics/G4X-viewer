import { useShallow } from "zustand/react/shallow";
import { useCellMasksLayerStore } from "../../../../stores/CellMasksLayerStore/CellMasksLayerStore";
import { Box, FormControlLabel, Grid, Input, Theme, useTheme } from "@mui/material";
import { GxSwitch } from "../../../../shared/components/GxSwitch";
import { GxSlider } from "../../../../shared/components/GxSlider";

const MIN_STROKE_WIDTH = 1;
const MAX_STROKE_WIDTH = 10;
const STROKE_WIDTH_STEP = 0.1;

export const CellMasksStrokeSettings = () => {
  const theme = useTheme();
  const sx = styles(theme);

  const [
    isCellStrokeOn,
    cellStrokeWidth,
    toggleCellStroke,
    setCellStrokeWidth,
  ] = useCellMasksLayerStore(
    useShallow((store) => [
      store.isCellStrokeOn,
      store.cellStrokeWidth,
      store.toggleCellStroke,
      store.setCellStrokeWidth,
    ])
  );

  const handleChange = (event: any) => {
    let inputValue = event.target.value;
    inputValue = inputValue.replace(",", ".");

    if (inputValue === "") {
      setCellStrokeWidth(MIN_STROKE_WIDTH);
      return;
    }

    if (/^\d*\.?\d{0,1}$/.test(inputValue)) {
      let newValue = parseFloat(inputValue);

      if (newValue > MAX_STROKE_WIDTH) {
        newValue = MAX_STROKE_WIDTH;
      } else if (newValue < MIN_STROKE_WIDTH) {
        newValue = MIN_STROKE_WIDTH;
      }

      setCellStrokeWidth(newValue);
    }
  };

  return (
    <Box sx={sx.strokeSettingsContainer}>
      <FormControlLabel
        label="Show stroke line"
        sx={sx.toggleSwitch}
        control={
          <GxSwitch
            disableTouchRipple
            onChange={toggleCellStroke}
            checked={isCellStrokeOn}
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
            value={cellStrokeWidth.toString()}
            size="small"
            onChange={handleChange}
            type="number"
            inputProps={{
              step: STROKE_WIDTH_STEP.toString(),
              max: MAX_STROKE_WIDTH.toString(),
              min: MIN_STROKE_WIDTH.toString(),
            }}
            sx={sx.textField}
          />
        </Grid>
        <Grid item xs sx={sx.sliderInputItem}>
          <GxSlider
            value={cellStrokeWidth}
            onChange={(_, newValue) => {
              setCellStrokeWidth(Array.isArray(newValue) ? newValue[0] : newValue);
            }}
            step={0.1}
            min={MIN_STROKE_WIDTH}
            max={MAX_STROKE_WIDTH}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  strokeSettingsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '8px',
  },
  toggleSwitch: {
    paddingLeft: '8px',
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
