import { Box, Typography } from "@mui/material";
import { ColormapSelector } from "./ColormapSelector";
import { OverviewToggle } from "./OverviewToggle";
import { MetadataLayerToggle } from "./MetadataLayerToggle";
import { LensSelect } from "./LensSelect";
import { useViewerStore } from "../../../stores/ViewerStore";
import { useBinaryFilesStore } from "../../../stores/BinaryFilesStore";
import { useLoader } from "../../../hooks/useLoader.hook";
import { GlobalSelectionSliders } from "./GlobalSelectionSliders";

export const ViewControllsSection = () => {
  const loader = useLoader();
  const [colormap] = useViewerStore((store) => store.colormap);
  const files = useBinaryFilesStore((store) => store.files);

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
        <OverviewToggle />
        {!!files.length && <MetadataLayerToggle />}
        {!colormap && shape[labels.indexOf("c")] > 1 && <LensSelect />}
      </Box>
    </Box>
  );
};

const sx = {
  sectionContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  subsectionTitle: {
    // textTransform: 'uppercase',
    fontWeight: 700,
    paddingLeft: '8px',
    marginBottom: '8px'
  }
}
