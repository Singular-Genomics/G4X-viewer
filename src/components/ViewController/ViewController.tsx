import { useShallow } from "zustand/react/shallow";
import { Box, IconButton, Typography } from "@mui/material";
import { ColormapSelector } from "./ColormapSelector/ColormapSelector";
import { GlobalSelectionSliders } from "./GlobalSelectionSliders/GlobalSelectionSliders";
import { useViewerStore } from "../../stores/ViewerStore/ViewerStore";
import { useMetadata } from "../../hooks/useMetadata.hook";
import { guessRgb } from "../../legacy/utils";
import { ChannelControllers } from "./ChannelControllers";
import { useLoader } from "../../hooks/useLoader.hook";
import { LensSelect } from "./LensSelect/LensSelect";
import { AddChannel } from "./AddChannel/AddChannel";
import CloseIcon from "@mui/icons-material/Close";
import { OverviewSelect } from "./OverviewSelect/OverviewSelect";
import { useEffect, useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import { GxLogo } from "../../shared/components/GxLogo";
import { GxLoader } from "../../shared/components/GxLoader";
import BinaryDropzoneButton from "./BinaryDropzoneButton/BinaryDropzoneButton";
import { ViewControllerProps } from "./ViewController.types";
import { MetadataLayerToggle } from "./MetadataLayerToggle";
import { useBinaryFilesStore } from "../../stores/BinaryFilesStore";
import ImageDropzoneButton from "./ImageDropzoneButton/ImageDropzoneButton";

export const ViewController = ({ imageLoaded }: ViewControllerProps) => {
  const [isControllerOn, setIsControllerOn] = useState(true);

  const [isViewerLoading, colormap] = useViewerStore(
    useShallow((store) => [store.isViewerLoading, store.colormap])
  );

  const files = useBinaryFilesStore((store) => store.files);

  useEffect(() => {
    window.dispatchEvent(new Event("onControllerToggle"));
  }, [isControllerOn]);

  const metadata = useMetadata();
  const loader = useLoader();

  const isRgb = metadata && guessRgb(metadata);
  const { shape, labels } = loader[0];

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
            {isViewerLoading ? (
              <Box sx={sx.viewControllerLoaderWrapper}>
                <GxLoader />
              </Box>
            ) : (
              <Box sx={sx.viewControllerSectionsWrapper}>
                <ImageDropzoneButton />
                <Box
                  sx={{
                    ...sx.viewControllerSectionsWrapper,
                    opacity: imageLoaded ? 1 : 0.25,
                    pointerEvents: imageLoaded ? "auto" : "none",
                  }}
                >
                  <BinaryDropzoneButton />
                  <Box>
                    <Typography sx={sx.viewControllerSectionHeader}>
                      Colormap
                    </Typography>
                    <ColormapSelector />
                  </Box>
                  <Box>
                    <Typography sx={sx.viewControllerSectionHeader}>
                      Global Selection
                    </Typography>
                    <GlobalSelectionSliders />
                  </Box>
                  <Box>
                    <Typography sx={sx.viewControllerSectionHeader}>
                      View Controlls
                    </Typography>
                    <OverviewSelect />
                    {!!files.length && <MetadataLayerToggle />}
                    {!colormap && shape[labels.indexOf("c")] > 1 && (
                      <LensSelect />
                    )}
                  </Box>
                  {!isViewerLoading && !isRgb && (
                    <Box>
                      <Typography sx={sx.viewControllerSectionHeader}>
                        Channels Settings
                      </Typography>
                      <ChannelControllers />
                      {!isRgb && <AddChannel />}
                    </Box>
                  )}
                </Box>
              </Box>
            )}
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
  viewControllerSectionHeader: {
    fontWeight: 700,
    color: "#000",
    marginBottom: "8px",
  },
  viewControllerSectionsWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
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
