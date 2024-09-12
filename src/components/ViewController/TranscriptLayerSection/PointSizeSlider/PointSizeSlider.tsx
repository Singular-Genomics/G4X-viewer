import { useShallow } from "zustand/react/shallow";
import { Grid, Input, Theme, useTheme } from "@mui/material";
import { useTranscriptLayerStore } from "../../../../stores/TranscriptLayerStore";
import { GxSlider } from "../../../../shared/components/GxSlider";
import { useState } from "react";

const MIN_POINT_SIZE = 1;
const MAX_POINT_SIZE = 10;
const POINT_SIZE_STEP = 0.1;

export const PointSizeSlider = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const [pointSize, setPointSize] = useTranscriptLayerStore(
    useShallow((store) => [store.pointSize, store.setPointSize])
  );

  const [sliderValue, setSliderValue] = useState<number>(pointSize);

  return (
    <Grid
      container
      direction="row"
      justifyContent="space-between"
      alignItems="center"
      sx={sx.sliderInputContainer}
    >
      <Grid item xs={1}>
        <Input
          value={pointSize.toString()}
          size="small"
          type="number"
          inputProps={{
            step: POINT_SIZE_STEP.toString(),
            max: MAX_POINT_SIZE.toString(),
            min: MIN_POINT_SIZE.toString(),
          }}
          sx={sx.textField}
          disabled
        />
      </Grid>
      <Grid item xs sx={sx.sliderInputItem}>
        <GxSlider
          value={sliderValue}
          onChangeCommitted={() => setPointSize(sliderValue)}
          onChange={(_, newValue) => {
            setSliderValue(Array.isArray(newValue) ? newValue[0] : newValue);
          }}
          step={0.1}
          min={MIN_POINT_SIZE}
          max={MAX_POINT_SIZE}
        />
      </Grid>
    </Grid>
  );
};

const styles = (theme: Theme) => ({
  sliderInputContainer: {
    paddingLeft: "8px",
  },
  sliderInputItem: {
    padding: "0px 8px 0px 16px",
  },
  textField: {
    marginBottom: "8px",
    "&.MuiInputBase-root::after": {
      borderBottom: "2px solid",
    },
    "&.MuiInputBase-root::before": {
      borderColor: `${theme.palette.gx.primary.black}`,
      borderBottomStyle: "solid",
    },
    "& .MuiInputBase-input": {
      textAlign: "center",
      WebkitTextFillColor: theme.palette.gx.primary.black,
    },
  },
});
