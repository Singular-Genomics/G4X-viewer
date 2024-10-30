import {
  AdditiveColormapExtension,
  DETAIL_VIEW_ID,
  getDefaultInitialViewState,
  LensExtension,
  PictureInPictureViewer,
} from "@hms-dbmi/viv";
import { useChannelsStore } from "../../stores/ChannelsStore/ChannelsStore";
import { useShallow } from "zustand/react/shallow";
import { DEFAULT_OVERVIEW, FILL_PIXEL_VALUE } from "../../shared/constants";
import { useViewerStore } from "../../stores/ViewerStore/ViewerStore";
import { Box } from "@mui/material";
import {
  useCellSegmentationLayer,
  useTranscriptLayer,
  useResizableContainer,
  useHEImageLayer,
} from "./PictureInPictureViewerAdapter.hooks";
import { useEffect } from "react";
import { Tooltip } from "../Tooltip";
import { debounce } from "lodash";
import { useHEImagesStore } from "../../stores/HEImagesStore";

export const PictureInPictureViewerAdapter = () => {
  const getLoader = useChannelsStore((store) => store.getLoader);
  const [heImageSource, isImageLoading] = useHEImagesStore(
    useShallow((store) => [store.heImageSource, store.isImageLoading])
  );
  const loader = getLoader();
  const { containerRef, containerSize } = useResizableContainer();
  const cellMasksLayer = useCellSegmentationLayer();
  const transcriptLayer = useTranscriptLayer();
  const heImageLayer = useHEImageLayer();

  useEffect(
    () =>
      useViewerStore.setState({
        viewportWidth: containerSize.width,
        viewportHeight: containerSize.height,
      }),
    [containerSize]
  );

  const [colors, contrastLimits, channelsVisible, selections] =
    useChannelsStore(
      useShallow((store) => [
        store.colors,
        store.contrastLimits,
        store.channelsVisible,
        store.selections,
      ])
    );

  const [
    colormap,
    isLensOn,
    isOverviewOn,
    lensSelection,
    onViewportLoad,
    viewState,
  ] = useViewerStore(
    useShallow((store) => [
      store.colormap,
      store.isLensOn,
      store.isOverviewOn,
      store.lensSelection,
      store.onViewportLoad,
      store.viewState,
    ])
  );

  useEffect(() => {
    if (!viewState && containerSize.width && containerSize.height) {
      const width = containerSize.width;
      const height = containerSize.height;
      const defualtViewerState = getDefaultInitialViewState(
        loader,
        { width, height },
        0.5
      );
      useViewerStore.setState({
        viewState: { ...defualtViewerState, id: DETAIL_VIEW_ID },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loader, containerSize.width, containerSize.height]);

  const deckProps = {
    layers: [cellMasksLayer, transcriptLayer],
  };

  if (heImageSource && !isImageLoading) {
    deckProps.layers = [heImageLayer, ...deckProps.layers];
  }

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
          viewStates={viewState ? [viewState] : []}
          onViewStateChange={debounce(
            ({ viewState: newViewState, viewId }) => {
              const z = Math.min(
                Math.max(Math.round(-(newViewState as any).zoom), 0),
                loader.length - 1
              );
              useViewerStore.setState({
                pyramidResolution: z,
                viewState: { ...newViewState, id: viewId },
              });
            },
            250,
            { trailing: true }
          )}
          hoverHooks={{
            handleValue: (values) =>
              useViewerStore.setState({
                pixelValues: values.map((value) =>
                  Number.isInteger(value)
                    ? value.toFixed(1).toString()
                    : FILL_PIXEL_VALUE
                ),
              }),
            // @ts-expect-error Error in Viv jsDOC declaration.
            // TODO: Fix when issue has beeen resolved and new version has been released.
            handleCoordnate: (coords: number[]) =>
              coords &&
              useViewerStore.setState({
                hoverCoordinates: {
                  x: coords[0].toFixed(0).toString(),
                  y: coords[1].toFixed(0).toString(),
                },
              }),
          }}
        />
      )}
      <Tooltip />
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
