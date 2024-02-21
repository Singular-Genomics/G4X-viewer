import { Box, Typography } from "@mui/material";
import { ViewerSourceType } from "./stores/ViewerStore/ViewerStore.types";
import { useViewerStore } from "./stores/ViewerStore/ViewerStore";
import { useImage } from "./hooks/useImage.hook";
import { PictureInPictureViewerAdapter } from "./components/PictureInPictureViewerAdapter/PictureInPictureViewerAdapter";
import { useEffect, useMemo } from "react";
import { SgLoader } from "singular-genomics-ui";
import { ViewController } from "./components/ViewController";
import { LogoBanner } from "./components/LogoBanner/LogoBanner";

export default function AvivatorTs() {
  const initSource: ViewerSourceType = useMemo(
    () => ({
      urlOrFile:
        "https://viv-demo.storage.googleapis.com/2018-12-18_ASY_H2B_bud_05_3D_8_angles.ome.tif",
      description: "Test Image",
      isDemoImage: true,
    }),
    []
  );

  const isViewerLoading = useViewerStore((store) => store.isViewerLoading);
  useEffect(() => {
    useViewerStore.setState({
      source: initSource,
    });
  }, [initSource]);
  useImage(initSource);

  return (
    <Box sx={sx.mainContainer}>
      <LogoBanner/>
      <Box sx={sx.viewerWrapper}>
        {!isViewerLoading ? (
          <PictureInPictureViewerAdapter />
        ) : (
          <Box sx={sx.loaderContainer}>
            <SgLoader />
            <Typography sx={sx.loadingText}>Loading Image...</Typography>
          </Box>
        )}
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
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
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
