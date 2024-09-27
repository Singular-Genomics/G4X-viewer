import { Box, Typography } from "@mui/material";
import { OverviewToggle } from "../ViewControllsSection/OverviewToggle";
import { useLoader } from "../../../hooks/useLoader.hook";
import { useViewerStore } from "../../../stores/ViewerStore";
import { LensToggle } from "../ViewControllsSection/LensToggle";
import { ChannelControllers } from "./ChannelControllers";
import { AddChannel } from "./ChannelControllers/AddChannel";

export const ChannelsSettingsSection = () => {
  const loader = useLoader();
  const [colormap] = useViewerStore((store) => store.colormap);
  const { shape, labels } = loader[0];

  return (
    <Box>
      <Box sx={sx.togglesWrapper}>
        <OverviewToggle />
        {!colormap && shape[labels.indexOf("c")] > 1 && <LensToggle />}
      </Box>
      <Box>
        <Typography sx={sx.controlsTitle}>Channels Controls</Typography>
        <ChannelControllers />
        <AddChannel />
      </Box>
    </Box>
  );
};

const sx = {
  togglesWrapper: {
    padding: "0px 0px 8px 8px",
  },
  controlsTitle: {
    fontWeight: 700,
    paddingLeft: "8px",
    marginBottom: "8px",
  },
};
