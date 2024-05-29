import { Box, Typography } from "@mui/material";
import { ColormapSelector } from "./ColormapSelector";
import { OverviewToggle } from "./OverviewToggle";
import { MetadataLayerToggle } from "./MetadataLayerToggle";
import { LensToggle } from "./LensToggle";
import { useViewerStore } from "../../../stores/ViewerStore";
import { useBinaryFilesStore } from "../../../stores/BinaryFilesStore";
import { useLoader } from "../../../hooks/useLoader.hook";
import { GlobalSelectionSliders } from "./GlobalSelectionSliders";
import { useCellMasksLayerStore } from "../../../stores/CellMasksLayerStore/CellMasksLayerStore";
import { CellMaskLayerToggle } from "./CellMaskLayerToggle";

export const ViewControllsSection = () => {
  const loader = useLoader();
  const [colormap] = useViewerStore((store) => store.colormap);
  const files = useBinaryFilesStore((store) => store.files);
  const cellsData = useCellMasksLayerStore((store) => store.cellMasksData);

  const { shape, labels } = loader[0];

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
          <OverviewToggle />
          {!!files.length && <MetadataLayerToggle />}
          {!!cellsData && <CellMaskLayerToggle/> }
          {!colormap && shape[labels.indexOf("c")] > 1 && <LensToggle />}
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
    gap: '8px',
    paddingLeft: "8px",
  },
};
