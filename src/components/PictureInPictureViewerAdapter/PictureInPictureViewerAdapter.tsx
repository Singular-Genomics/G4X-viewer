import {
  AdditiveColormapExtension,
  LensExtension,
  PictureInPictureViewer,
} from "@hms-dbmi/viv";
import { useChannelsStore } from "../../stores/ChannelsStore/ChannelsStore";
import { useShallow } from "zustand/react/shallow";
import { useLoader } from "../../hooks/useLoader.hook";
import { DEFAULT_OVERVIEW } from "../../shared/constants";
import { useViewerStore } from "../../stores/ViewerStore/ViewerStore";
import { Box } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";

export const PictureInPictureViewerAdapter = () => {
  const containerRef = useRef<HTMLDivElement>();
  const [containerSize, setContainerSize] = useState<{ width: number; height: number;}>({width: 0, height: 0});

  const handleResize = useCallback(() => {
    if (containerRef.current) {
      setContainerSize({
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
      });
    }
  }, [containerRef]);

  useEffect(() => {
    handleResize();
    window.addEventListener("resize", handleResize);
    window.addEventListener('onControllerToggle', handleResize)
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener('onControllerToggle', handleResize);
    };
  }, [handleResize]);

  const [colors, contrastLimits, channelsVisible, selections] =
    useChannelsStore(
      useShallow((store) => [
        store.colors,
        store.contrastLimits,
        store.channelsVisible,
        store.selections,
      ])
    );

  const [colormap, isLensOn, isOverviewOn, lensSelection, onViewportLoad] = useViewerStore(
    useShallow((store) => [
      store.colormap,
      store.isLensOn,
      store.isOverviewOn,
      store.lensSelection,
      store.onViewportLoad,
    ])
  );

  const loader = useLoader();

  return (
    <Box sx={sx.viewerContainer} ref={containerRef}>
      {containerSize.width && containerSize.height && (
        <PictureInPictureViewer
          contrastLimits={contrastLimits}
          colors={colors}
          channelsVisible={channelsVisible}
          loader={loader}
          selections={selections}
          overview={DEFAULT_OVERVIEW}
          overviewOn={isOverviewOn}
          height={containerSize.height}
          width={containerSize.width}
          extensions={[
            colormap ? new AdditiveColormapExtension() : new LensExtension(),
          ]}
          lensSelection={lensSelection}
          lensEnabled={isLensOn}
          colormap={colormap}
          onViewportLoad={onViewportLoad}
          hoverHooks={{
            handleValue: (values) =>
              useViewerStore.setState({
                pixelValues: values.map((value) => value.toString()),
              }),
            handleCoordinate: () => {},
          }}
        />
      )}
    </Box>
  );
};

const sx = {
  viewerContainer: {
    position: "relative",
    width: "100%",
    height: "100%",
  },
};
