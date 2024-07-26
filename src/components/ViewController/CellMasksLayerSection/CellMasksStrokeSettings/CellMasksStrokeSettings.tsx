import { useShallow } from "zustand/react/shallow";
import { useCellSegmentationLayerStore } from "../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore";
import {
  Box,
  FormControlLabel,
  Grid,
  Input,
  Theme,
  useTheme,
} from "@mui/material";
import { GxSwitch } from "../../../../shared/components/GxSwitch";
import { GxSlider } from "../../../../shared/components/GxSlider";
import { useState } from "react";

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
  ] = useCellSegmentationLayerStore(
    useShallow((store) => [
      store.isCellStrokeOn,
      store.cellStrokeWidth,
      store.toggleCellStroke,
      store.setCellStrokeWidth,
    ])
  );

  const [sliderValue, setSliderValue] = useState<number>(cellStrokeWidth);

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
            type="number"
            inputProps={{
              step: STROKE_WIDTH_STEP.toString(),
              max: MAX_STROKE_WIDTH.toString(),
              min: MIN_STROKE_WIDTH.toString(),
            }}
            sx={{
              ...sx.textFieldBase,
              ...(isCellStrokeOn && sx.textFieldEnabled),
            }}
            disabled
          />
        </Grid>
        <Grid item xs sx={sx.sliderInputItem}>
          <GxSlider
            value={sliderValue}
            onChange={(_, newValue) => {
              setSliderValue(Array.isArray(newValue) ? newValue[0] : newValue);
            }}
            onChangeCommitted={() => {
              setCellStrokeWidth(sliderValue);
            }}
            step={0.1}
            min={MIN_STROKE_WIDTH}
            max={MAX_STROKE_WIDTH}
            disabled={!isCellStrokeOn}
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
  textFieldBase: {
    marginBottom: "8px",
    "&.MuiInputBase-root::after": {
      borderBottom: "2px solid",
    },
    "& .MuiInputBase-input": {
      textAlign: "center",
    },
  },
  textFieldEnabled: {
    "& .MuiInputBase-input": {
      textAlign: "center",
      WebkitTextFillColor: theme.palette.gx.primary.black,
    },
    "&.MuiInputBase-root::before": {
      borderColor: `${theme.palette.gx.primary.black}`,
      borderBottomStyle: "solid",
    },
  },
});
