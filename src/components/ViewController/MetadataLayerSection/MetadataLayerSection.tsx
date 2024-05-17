import { Box, Typography } from "@mui/material";
import { PointSizeSlider } from "./PointSizeSlider";
import { ExperimentalToggles } from "./ExperimentalToggles";

export const MetadataLayerSection = () => (
  <Box sx={sx.sectionContainer}>
    <Box>
      <Typography sx={sx.subsectionTitle}>Point Size</Typography>
      <PointSizeSlider />
    </Box>
    <Box>
      <Typography sx={sx.subsectionTitle}>Experimental Options</Typography>
      <ExperimentalToggles />
    </Box>
  </Box>
);

const sx = {
  sectionContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  subsectionTitle: {
    fontWeight: 700,
    paddingLeft: "8px",
    marginBottom: "8px",
  },
};
