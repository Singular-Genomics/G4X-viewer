import { Box, Typography } from "@mui/material";
import { useBrightfieldImagesStore } from "../../../stores/BrightfieldImagesStore";
import { useState } from "react";
import { GxSlider } from "../../../shared/components/GxSlider";
import { BrightfieldImageSelector } from "./BrightfieldImageSelector/BrightfieldImageSelector";

export const BrightfieldImagesSection = () => {
  const sx = styles();

  const { brightfieldImageSource, opacity, availableImages } =
    useBrightfieldImagesStore();

  const [opacitySliderValue, setOpacitySliderValue] = useState<number>(
    opacity * 100
  );

  return (
    <Box sx={sx.sectionContainer}>
      <Box>
        <Typography sx={sx.subsectionTitle}>Layer opacity</Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "16px",
            marginLeft: "8px",
          }}
        >
          <Typography>0%</Typography>
          <GxSlider
            value={opacitySliderValue}
            onChange={(_, newValue) => {
              setOpacitySliderValue(
                Array.isArray(newValue) ? newValue[0] : newValue
              );
            }}
            onChangeCommitted={() =>
              useBrightfieldImagesStore.setState({
                opacity: +(opacitySliderValue / 100).toFixed(2),
              })
            }
            min={0}
            max={100}
            step={1}
            disabled={!brightfieldImageSource}
          />
          <Typography>100%</Typography>
        </Box>
      </Box>
      <Box>
        <Typography sx={sx.subsectionTitle}>Available H&E Images</Typography>
        <BrightfieldImageSelector images={availableImages} />
      </Box>
    </Box>
  );
};

const styles = () => ({
  sectionContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  subsectionTitle: {
    fontWeight: 700,
    marginLeft: "8px",
    marginBottom: "8px",
  },
  sliderWrapper: {
    display: "flex",
    alignItems: "center",
  },
  opacitySlider: {
    padding: "0 8px 0 16px",
  },
});
