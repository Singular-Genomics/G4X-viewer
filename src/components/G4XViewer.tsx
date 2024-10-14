import { Box, Theme, Typography, alpha, useTheme } from "@mui/material";
import { useViewerStore } from "../stores/ViewerStore/ViewerStore";
import { PictureInPictureViewerAdapter } from "./PictureInPictureViewerAdapter/PictureInPictureViewerAdapter";

import { ViewController } from "./ViewController";
import { LogoBanner } from "./LogoBanner/LogoBanner";
import { useShallow } from "zustand/react/shallow";
import { GxLoader } from "../shared/components/GxLoader";
import { useProteinImage } from "../hooks/useProteinImage.hook";
import { ImageInfo } from "./ImageInfo/ImageInfo";

export default function G4XViewer() {
  const theme = useTheme();
  const sx = styles(theme);

  const [source, isViewerLoading] = useViewerStore(
    useShallow((store) => [store.source, store.isViewerLoading])
  );

  useProteinImage(source);

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
              <GxLoader version="light" />
              <Typography sx={sx.loadingText}>Loading Image...</Typography>
            </Box>
          )}
        </>
      </Box>
      <ViewController imageLoaded={!!source} />
    </Box>
  );
}

const styles = (theme: Theme) => ({
  mainContainer: {
    background: `linear-gradient(0deg, ${theme.palette.gx.darkGrey[500]}, ${theme.palette.gx.darkGrey[100]})`,
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
    background: alpha(theme.palette.gx.lightGrey[100], 0.2),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
    padding: "32px",
    borderRadius: "32px",
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
    color: theme.palette.gx.lightGrey[900],
    fontSize: "16px",
  },
});
