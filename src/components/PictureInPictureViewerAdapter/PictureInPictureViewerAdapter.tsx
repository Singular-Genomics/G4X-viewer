import {
  AdditiveColormapExtension,
  LensExtension,
  PictureInPictureViewer,
} from "@hms-dbmi/viv";
import { useChannelsStore } from "../../stores/ChannelsStore/ChannelsStore";
import { useShallow } from "zustand/react/shallow";
import { useLoader } from "../../hooks/useLoader.hook";
import { DEFAULT_OVERVIEW, FILL_PIXEL_VALUE } from "../../shared/constants";
import { useViewerStore } from "../../stores/ViewerStore/ViewerStore";
import { Box } from "@mui/material";
import { useCallback, useEffect, useRef, useState } from "react";
import MetadataLayer from "../../layers/metadata-layer";
import { DETAIL_VIEW_ID } from "@hms-dbmi/viv";
import { getVivId } from "../../utils/utils";
import { getCutomTooltp } from "./PictureInPictureViewerAdapter.helpers";
import { useBinaryFilesStore } from "../../stores/BinaryFilesStore";

export const PictureInPictureViewerAdapter = () => {
  const containerRef = useRef<HTMLDivElement>();
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  }>({ width: 0, height: 0 });

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
    window.addEventListener("onControllerToggle", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("onControllerToggle", handleResize);
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

  const [colormap, isLensOn, isOverviewOn, lensSelection, onViewportLoad] =
    useViewerStore(
      useShallow((store) => [
        store.colormap,
        store.isLensOn,
        store.isOverviewOn,
        store.lensSelection,
        store.onViewportLoad,
      ])
    );

  const loader = useLoader();

  const files = useBinaryFilesStore((state) => state.files);
  const config = useBinaryFilesStore((state) => state.config);

  const metadataLayer = new MetadataLayer({
    id: `${getVivId(DETAIL_VIEW_ID)}-metadata-layer`,
    files: files,
    config: config,
    visible: !!files.length,
  });

  const deckProps = {
    layers: [metadataLayer],
    getTooltip: getCutomTooltp,
  };

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
          deckProps={deckProps}
          colormap={colormap}
          onViewportLoad={onViewportLoad}
          onViewStateChange={({ viewState }) => {
            const z = Math.min(
              Math.max(Math.round(-(viewState as any).zoom), 0),
              loader.length - 1
            );
            useViewerStore.setState({ pyramidResolution: z });
          }}
          hoverHooks={{
            handleValue: (values) =>
              useViewerStore.setState({
                pixelValues: values.map((value) =>
                  value ? value.toString() : FILL_PIXEL_VALUE
                ),
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
