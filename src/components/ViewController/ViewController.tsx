import { Box, IconButton, Theme, useTheme } from "@mui/material";
import { useMetadata } from "../../hooks/useMetadata.hook";
import { guessRgb } from "../../legacy/utils";
import { ChannelControllers } from "./ChannelControllers";
import { AddChannel } from "./ChannelControllers/AddChannel/AddChannel";

import { useEffect, useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import { ViewControllerProps } from "./ViewController.types";
import { GxCollapsibleSection } from "../../shared/components/GxCollapsibleSection/GxCollapsibleSection";
import { SourceFilesSection } from "./SourceFilesSection/SourceFilesSection";
import { ViewControllsSection } from "./ViewControllsSection/ViewControllsSection";
import { MetadataLayerSection } from "./MetadataLayerSection/MetadataLayerSection";
import { useBinaryFilesStore } from "../../stores/BinaryFilesStore";
import { useCellSegmentationLayerStore } from "../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore";
import { CellMasksLayerSection } from "./CellMasksLayerSection";
import { ControllerHeader } from "./ControllerHeader";
import { OverviewToggle } from "../../components/ViewController/ViewControllsSection/OverviewToggle";
import { useLoader } from "../../hooks/useLoader.hook";
import { useViewerStore } from "../../stores/ViewerStore";
import { LensToggle } from "../../components/ViewController/ViewControllsSection/LensToggle";

export const ViewController = ({ imageLoaded }: ViewControllerProps) => {
  const theme = useTheme();
  const sx = styles(theme);
  const loader = useLoader();
  const [colormap] = useViewerStore((store) => store.colormap);


  const { shape, labels } = loader[0];
  const [isControllerOn, setIsControllerOn] = useState(true);
  const metadataFiles = useBinaryFilesStore((store) => store.files);
  const cellMasksFiles = useCellSegmentationLayerStore(
    (store) => store.cellMasksData
  );
  const metadata = useMetadata();

  useEffect(() => {
    window.dispatchEvent(new Event("onControllerToggle"));
  }, [isControllerOn]);

  const isRgb = metadata && guessRgb(metadata);

  return (
    <>
      {isControllerOn ? (
        <Box sx={sx.viewControllerContainer}>
          <Box sx={sx.viewControllerContentWrapper}>
            <ControllerHeader
              onCloseController={() => setIsControllerOn(false)}
            />
            <Box sx={sx.viewControllerSectionsWrapper}>
              <GxCollapsibleSection
                sectionTitle="Source Files"
                defultState="open"
              >
                <SourceFilesSection />
              </GxCollapsibleSection>
              <GxCollapsibleSection
                sectionTitle="View Controlls"
                disabled={!imageLoaded}
              >
                <ViewControllsSection />
              </GxCollapsibleSection>
              <GxCollapsibleSection
                sectionTitle="Channels Settings"
                disabled={!imageLoaded || isRgb}
              >
                 <OverviewToggle />
                  {!colormap && shape[labels.indexOf("c")] > 1 && <LensToggle />}
                  <ChannelControllers />
                <AddChannel />
              </GxCollapsibleSection>
              <GxCollapsibleSection
                sectionTitle="Metadata Layer Settings"
                disabled={!imageLoaded || !metadataFiles.length}
                unmountOnExit={false}
              >
                <MetadataLayerSection />
              </GxCollapsibleSection>
              <GxCollapsibleSection
                sectionTitle="Cell Masks Layer Settings"
                disabled={!imageLoaded || !cellMasksFiles?.length}
              >
                <CellMasksLayerSection />
              </GxCollapsibleSection>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box sx={sx.viewControllerToggleButton}>
          <IconButton
            size="large"
            disableTouchRipple
            onClick={() => setIsControllerOn(true)}
            style={{ color: theme.palette.gx.primary.white }}
          >
            <MenuIcon fontSize="large" />
          </IconButton>
        </Box>
      )}
    </>
  );
};

const styles = (theme: Theme) => ({
  viewControllerContainer: {
    backgroundColor: theme.palette.gx.mediumGrey[300],
    padding: "8px 0 0 8px",
    width: "550px",
    height: "100vh",
  },
 
  viewControllerContentWrapper: {
    backgroundColor: theme.palette.gx.lightGrey[100],
    borderTopLeftRadius: "32px",
    padding: "16px 8px 16px 16px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflow: "auto",
    scrollbarWidth: "thin",
  },
  viewControllerSectionsWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    paddingRight: "8px",
    overflowY: "scroll",
    scrollbarColor: "#8E9092 transparent",
  },
  viewControllerLoaderWrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
  },
  viewControllerToggleButton: {
    position: "absolute",
    top: 0,
    right: 10,
  },
});
