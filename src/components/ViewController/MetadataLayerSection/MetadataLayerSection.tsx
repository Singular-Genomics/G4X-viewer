import { Box, Typography } from "@mui/material";
import { PointSizeSlider } from "./PointSizeSlider";

export const MetadataLayerSection = () => (
  <Box sx={sx.sectionContainer}>
    <Box>
      <Typography sx={sx.subsectionTitle}>Point Size</Typography>
      <PointSizeSlider />
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
