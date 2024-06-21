import { useShallow } from "zustand/react/shallow";
import { Grid, Input, Theme, useTheme } from "@mui/material";
import { useMetadataLayerStore } from "../../../../stores/MetadataLayerStore";
import { GxSlider } from "../../../../shared/components/GxSlider";

const MIN_POINT_SIZE = 1;
const MAX_POINT_SIZE = 10;
const POINT_SIZE_STEP = 0.1;

export const PointSizeSlider = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const [pointSize, setPointSize] = useMetadataLayerStore(
    useShallow((store) => [store.pointSize, store.setPointSize])
  );

  const handleChange = (event: any) => {
    let inputValue = event.target.value;
    inputValue = inputValue.replace(",", ".");

    if (inputValue === "") {
      setPointSize(0);
      return;
    }

    if (/^\d*\.?\d{0,1}$/.test(inputValue)) {
      let newValue = parseFloat(inputValue);

      if (newValue > MAX_POINT_SIZE) {
        newValue = MAX_POINT_SIZE;
      } else if (newValue < MIN_POINT_SIZE) {
        newValue = MIN_POINT_SIZE;
      }

      setPointSize(newValue);
    }
  };

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
            onChange={handleChange}
            type="number"
            inputProps={{
              step: POINT_SIZE_STEP.toString(),
              max: MAX_POINT_SIZE.toString(),
              min: MIN_POINT_SIZE.toString(),
            }}
            sx={sx.textField}
          />
        </Grid>
        <Grid item xs sx={sx.sliderInputItem}>
          <GxSlider
            value={pointSize}
            onChange={(_, newValue) => {
              setPointSize(Array.isArray(newValue) ? newValue[0] : newValue);
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
    paddingLeft: '8px',
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
