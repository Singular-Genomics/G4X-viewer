import { Box, Typography } from "@mui/material";
import { useViewerStore } from "../stores/ViewerStore/ViewerStore";
import { useImage } from "../hooks/useImage.hook";
import { PictureInPictureViewerAdapter } from "./PictureInPictureViewerAdapter/PictureInPictureViewerAdapter";

import { ViewController } from "./ViewController";
import { LogoBanner } from "./LogoBanner/LogoBanner";
import { AvivatorTsProps } from "./AvivatorTs.types";
import { useShallow } from "zustand/react/shallow";
import { ImageInfo } from "./ImageInfo/ImageInfo";
import { ScLoader } from "../shared/components/ScLoader";

export default function AvivatorTs({ initSource }: AvivatorTsProps) {
  const [source, isViewerLoading] = useViewerStore(
    useShallow((store) => [store.source, store.isViewerLoading])
  );

  useImage(source || initSource);

  return (
    <Box sx={sx.mainContainer}>
      <LogoBanner />
      <Box sx={sx.viewerWrapper}>
        <>
          {!isViewerLoading ? (
            <PictureInPictureViewerAdapter />
          ) : (
            <Box sx={sx.loaderContainer}>
              <ScLoader version="light"/>
              <Typography sx={sx.loadingText}>Loading Image...</Typography>
            </Box>
          )}
          <ImageInfo />
        </>
      </Box>
      <ViewController />
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
    position: 'relative',
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
};
