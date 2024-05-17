import { Box, IconButton, Typography } from "@mui/material";
import { useMetadata } from "../../hooks/useMetadata.hook";
import { guessRgb } from "../../legacy/utils";
import { ChannelControllers } from "./ChannelControllers";
import { AddChannel } from "./ChannelControllers/AddChannel/AddChannel";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import { GxLogo } from "../../shared/components/GxLogo";
import { ViewControllerProps } from "./ViewController.types";
import { CollapsibleSection } from "./CollapsibleSection/CollapsibleSection";
import { SourceFilesSection } from "./SourceFilesSection/SourceFilesSection";
import { ViewControllsSection } from "./ViewControllsSection/ViewControllsSection";

export const ViewController = ({ imageLoaded }: ViewControllerProps) => {
  const [isControllerOn, setIsControllerOn] = useState(true);

  useEffect(() => {
    window.dispatchEvent(new Event("onControllerToggle"));
  }, [isControllerOn]);

  const metadata = useMetadata();
  const isRgb = metadata && guessRgb(metadata);

  return (
    <>
      {isControllerOn ? (
        <Box sx={sx.viewControllerContainer}>
          <Box sx={sx.viewControllerContentWrapper}>
            <Box sx={sx.viewControllerHeaderWrapper}>
              <GxLogo version="dark" />
              <Typography sx={sx.viewControllerHeaderText}>
                G4X Viewer
              </Typography>
              <IconButton
                sx={sx.viewControllerHeaderButton}
                onClick={() => {
                  setIsControllerOn(false);
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <Box sx={sx.viewControllerSectionsWrapper}>
              <CollapsibleSection
                sectionTitle="Source Files"
                defultState="open"
              >
                <SourceFilesSection />
              </CollapsibleSection>
              <CollapsibleSection
                sectionTitle="View Controlls"
                disabled={!imageLoaded}
              >
                <ViewControllsSection />
              </CollapsibleSection>
              <CollapsibleSection
                sectionTitle="Channels Settings"
                disabled={!imageLoaded || isRgb}
              >
                <ChannelControllers />
                <AddChannel />
              </CollapsibleSection>
            </Box>
          </Box>
        </Box>
      ) : (
        <Box sx={sx.viewControllerToggleButton}>
          <IconButton
            size="large"
            disableTouchRipple
            onClick={() => setIsControllerOn(true)}
            style={{ color: "#FFF" }}
          >
            <MenuIcon fontSize="large" />
          </IconButton>
        </Box>
      )}
    </>
  );
};

const sx = {
  viewControllerContainer: {
    backgroundColor: "#8E9092",
    padding: "10px 0 0 10px",
    width: "450px",
    height: "100vh",
  },
  viewControllerHeaderWrapper: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginBottom: "10px",
  },
  viewControllerHeaderText: {
    fontWeight: 700,
    fontSize: "20px",
  },
  viewControllerHeaderButton: {
    marginLeft: "auto",
  },
  viewControllerContentWrapper: {
    backgroundColor: "rgba(255, 255, 255, 0.6)",
    borderTopLeftRadius: "20px",
    padding: "20px 10px 20px 20px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    overflow: "auto",
    scrollbarWidth: "thin",
  },
  viewControllerSectionsWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: '8px',
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
};
