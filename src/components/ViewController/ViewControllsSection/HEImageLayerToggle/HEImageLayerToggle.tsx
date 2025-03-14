import { useShallow } from "zustand/react/shallow";
import { useHEImageStore } from "../../../../stores/HEImageStore";
import {
  Box,
  Collapse,
  FormControlLabel,
  Theme,
  Typography,
  useTheme,
} from "@mui/material";
import { GxCheckbox } from "../../../../shared/components/GxCheckbox";
import { GxSlider } from "../../../../shared/components/GxSlider";

export const HEImageLayerToggle = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const [isLayerVisible, toggleImageLayer, opacity] = useHEImageStore(
    useShallow((store) => [
      store.isLayerVisible,
      store.toggleImageLayer,
      store.opacity,
    ])
  );

  return (
    <Box>
      <FormControlLabel
        label="H&E Image Layer"
        control={
          <GxCheckbox
            onChange={toggleImageLayer}
            checked={isLayerVisible}
            disableTouchRipple
          />
        }
      />
      <Collapse in={isLayerVisible} sx={sx.subSectionWrapper}>
        <Typography sx={sx.sliderTitle}>Layer opacity:</Typography>
        <Box sx={{ padding: "0 16px" }}>
          <GxSlider
            value={opacity * 100}
            onChange={(_, newValue) => {
              const parsedValue = Array.isArray(newValue)
                ? newValue[0]
                : newValue;
              useHEImageStore.setState({
                opacity: +(parsedValue / 100).toFixed(2),
              });
            }}
            min={0}
            max={100}
            step={1}
          />
        </Box>
      </Collapse>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  subSectionWrapper: {
    marginLeft: "32px",
    borderLeft: `5px solid ${theme.palette.gx.mediumGrey[100]}`,
    paddingLeft: "8px",
  },
  sliderTitle: {
    marginLeft: "16px",
  },
  opacitySlider: {
    padding: "0 8px",
  },
});
