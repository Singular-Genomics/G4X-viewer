import { Box, Typography } from "@mui/material";
import { useViewerStore } from "../stores/ViewerStore/ViewerStore";
import { PictureInPictureViewerAdapter } from "./PictureInPictureViewerAdapter/PictureInPictureViewerAdapter";

import { ViewController } from "./ViewController";
import { LogoBanner } from "./LogoBanner/LogoBanner";
import { useShallow } from "zustand/react/shallow";
import { ScLoader } from "../shared/components/ScLoader";
import { useImage } from "../hooks/useImage.hook";
import { ImageInfo } from "./ImageInfo/ImageInfo";

export default function G4XViewer() {
  const [source, isViewerLoading] = useViewerStore(
    useShallow((store) => [store.source, store.isViewerLoading])
  );

  useImage(source);

  return (
    <Box sx={sx.mainContainer}>
      <LogoBanner />
      <Box sx={sx.viewerWrapper}>
        <>
          {!isViewerLoading ? (
            source ? (
              <>
                <PictureInPictureViewerAdapter />
                <ImageInfo />
              </>
            ) : (
              <Typography sx={sx.infoText} variant="h2">
                Please upload an image file to view.
              </Typography>
            )
          ) : (
            <Box sx={sx.loaderContainer}>
              <ScLoader version="light" />
              <Typography sx={sx.loadingText}>Loading Image...</Typography>
            </Box>
          )}
        </>
      </Box>
      <ViewController imageLoaded={!!source} />
    </Box>
  );
}

const sx = {
  mainContainer: {
    background: "linear-gradient(0deg, #3F4447, #1E1E1E)",
    minHeight: "100vh",
    display: "flex",
  },
  viewerWrapper: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  loaderContainer: {
    background: "rgba(190, 190, 190, 0.1)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    padding: "30px",
    borderRadius: "30px",
  },
  loadingText: {
    fontSize: "30px",
    color: "#FFF",
    textTransform: "uppercase",
  },
  buttonGroup: {
    width: "300px",
    display: "flex",
    justifyContent: "space-between",
  },
  infoText: {
    color: "rgb(248, 248, 248)",
    fontSize: "16px",
  },
};
