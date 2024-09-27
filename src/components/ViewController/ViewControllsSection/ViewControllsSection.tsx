import { Box, Typography } from "@mui/material";
import { ColormapSelector } from "./ColormapSelector";

import { GlobalSelectionSliders } from "./GlobalSelectionSliders";
import { MetadataLayerToggle } from "./MetadataLayerToggle";
import { CellMaskLayerToggle } from "./CellMaskLayerToggle";
import { useCellSegmentationLayerStore } from "../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore";
import { useBinaryFilesStore } from "../../../stores/BinaryFilesStore";

export const ViewControllsSection = () => {
  const files = useBinaryFilesStore((store) => store.files);
  const cellsData = useCellSegmentationLayerStore(
    (store) => store.cellMasksData
  );

  return (
    <Box sx={sx.sectionContainer}>
      <Box>
        <Typography sx={sx.subsectionTitle}>Colormap</Typography>
        <ColormapSelector />
      </Box>
      <Box>
        <Typography sx={sx.subsectionTitle}>Global Selection</Typography>
        <GlobalSelectionSliders />
      </Box>
      <Box>
        <Typography sx={sx.subsectionTitle}>Layers Toggles</Typography>
        <Box sx={sx.togglesSubSection}>
          {!!files.length && <MetadataLayerToggle />}
          {!!cellsData && <CellMaskLayerToggle />}
        </Box>
      </Box>
    </Box>
  );
};

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
  togglesSubSection: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    paddingLeft: "8px",
  },
};
