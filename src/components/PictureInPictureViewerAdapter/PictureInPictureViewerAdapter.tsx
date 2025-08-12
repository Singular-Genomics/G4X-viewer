import { AdditiveColormapExtension, DETAIL_VIEW_ID, getDefaultInitialViewState, LensExtension } from '@hms-dbmi/viv';
import { useChannelsStore } from '../../stores/ChannelsStore/ChannelsStore';
import { useShallow } from 'zustand/react/shallow';
import { DEFAULT_OVERVIEW, FILL_PIXEL_VALUE } from '../../shared/constants';
import { useViewerStore } from '../../stores/ViewerStore/ViewerStore';
import { alpha, Box, IconButton, Tooltip as MuiTooltip, Theme, useTheme } from '@mui/material';
import {
  useCellSegmentationLayer,
  useTranscriptLayer,
  useResizableContainer,
  useBrightfieldImageLayer
} from './PictureInPictureViewerAdapter.hooks';
import { useEffect, useRef } from 'react';
import { Tooltip } from '../Tooltip';
import { debounce } from 'lodash';
import { useBrightfieldImagesStore } from '../../stores/BrightfieldImagesStore';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useSnackbar } from 'notistack';
import PictureInPictureViewer from '../PictureInPictureViewer';
import { useTranslation } from 'react-i18next';

export const PictureInPictureViewerAdapter = () => {
  const getLoader = useChannelsStore((store) => store.getLoader);
  const [brightfieldImageSource, isImageLoading] = useBrightfieldImagesStore(
    useShallow((store) => [store.brightfieldImageSource, store.isImageLoading])
  );
  const loader = getLoader();
  const { t } = useTranslation();
  const { containerRef, containerSize } = useResizableContainer();
  const cellMasksLayer = useCellSegmentationLayer();
  const transcriptLayer = useTranscriptLayer();
  const brightfieldImageLayer = useBrightfieldImageLayer();
  const deckGLRef = useRef<any>(null);
  const { enqueueSnackbar } = useSnackbar();

  const debouncedUpdateRef = useRef<any>(null);

  const theme = useTheme();
  const sx = styles(theme);

  useEffect(
    () =>
      useViewerStore.setState({
        viewportWidth: containerSize.width,
        viewportHeight: containerSize.height
      }),
    [containerSize]
  );

  const [colors, contrastLimits, channelsVisible, selections] = useChannelsStore(
    useShallow((store) => [store.colors, store.contrastLimits, store.channelsVisible, store.selections])
  );

  const [colormap, isLensOn, isOverviewOn, lensSelection, onViewportLoad, viewState] = useViewerStore(
    useShallow((store) => [
      store.colormap,
      store.isLensOn,
      store.isOverviewOn,
      store.lensSelection,
      store.onViewportLoad,
      store.viewState
    ])
  );

  useEffect(() => {
    debouncedUpdateRef.current = debounce(
      (zoom: number) => {
        const z = Math.min(Math.max(Math.round(-zoom), 0), loader.length - 1);
        useViewerStore.setState({
          pyramidResolution: z
        });
      },
      250,
      { trailing: true }
    );

    return () => {
      if (debouncedUpdateRef.current) {
        debouncedUpdateRef.current.cancel();
      }
    };
  }, [loader.length]);

  useEffect(() => {
    if (containerSize.width && containerSize.height) {
      const width = containerSize.width;
      const height = containerSize.height;

      if (!viewState) {
        // Create initial viewState
        const defualtViewerState = getDefaultInitialViewState(loader, { width, height }, 0.5);
        useViewerStore.setState({
          viewState: {
            ...defualtViewerState,
            id: DETAIL_VIEW_ID,
            width,
            height
          }
        });
      } else {
        // Update existing viewState with new dimensions
        useViewerStore.setState({
          viewState: {
            ...viewState,
            width,
            height
          }
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loader, containerSize.width, containerSize.height]);

  const takeScreenshot = () => {
    try {
      if (!deckGLRef.current?.deck) {
        throw new Error('DeckGL reference is not available');
      }

      const deck = deckGLRef.current.deck;
      const fileName = `screenshot-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;

      // Force an immediate redraw to ensure the scene is rendered
      if (typeof deck.redraw === 'function') {
        // Use synchronous redraw
        deck.redraw(true);
      }

      const canvas = deck.canvas;
      if (!canvas) {
        throw new Error('Canvas not available');
      }

      // Get the data URL right away
      const result = canvas.toDataURL('image/png');

      // Create and trigger download
      const link = document.createElement('a');
      link.href = result;
      link.download = `${fileName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      enqueueSnackbar({
        message: t('viewer.screenshotError', { message: (error as Error).message }),
        variant: 'gxSnackbar',
        titleMode: 'error'
      });
    }
  };

  const deckProps = {
    layers: [cellMasksLayer, transcriptLayer],
    ref: deckGLRef,
    glOptions: {
      preserveDrawingBuffer: true
    }
  };

  if (brightfieldImageSource && !isImageLoading) {
    deckProps.layers = [brightfieldImageLayer, ...deckProps.layers];
  }

  return (
    <Box
      sx={sx.viewerContainer}
      ref={containerRef}
    >
      {containerSize.width && containerSize.height && (
        <>
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
            extensions={[colormap ? new AdditiveColormapExtension() : new LensExtension()]}
            lensSelection={lensSelection}
            lensEnabled={isLensOn}
            deckProps={deckProps}
            colormap={colormap}
            onViewportLoad={onViewportLoad}
            viewStates={viewState ? [viewState] : []}
            onViewStateChange={({ viewState: newViewState, viewId }: { viewState: any; viewId: any }) => {
              // Update the viewState immediately
              useViewerStore.setState({
                viewState: { ...newViewState, id: viewId }
              });

              // Update the pyramidResolution with debounce
              if (debouncedUpdateRef.current) {
                debouncedUpdateRef.current((newViewState as any).zoom);
              }
            }}
            hoverHooks={
              {
                handleValue: (values: any) =>
                  useViewerStore.setState({
                    pixelValues: values.map((value: any) =>
                      Number.isInteger(value) ? value.toFixed(1).toString() : FILL_PIXEL_VALUE
                    )
                  }),
                handleCoordnate: (coords: number[]) =>
                  coords &&
                  useViewerStore.setState({
                    hoverCoordinates: {
                      x: coords[0].toFixed(0).toString(),
                      y: coords[1].toFixed(0).toString()
                    }
                  })
              } as any
            }
          />
          <MuiTooltip title={t('viewer.screenshotTooltip')}>
            <IconButton
              sx={sx.screenshotButton}
              onClick={takeScreenshot}
              color="primary"
            >
              <PhotoCameraIcon />
            </IconButton>
          </MuiTooltip>
        </>
      )}
      <Tooltip />
    </Box>
  );
};

const styles = (theme: Theme) => ({
  viewerContainer: {
    position: 'relative',
    width: '100%',
    height: '100%'
  },
  screenshotButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    zIndex: 100,
    color: theme.palette.gx.lightGrey[300],
    backgroundColor: alpha(theme.palette.gx.primary.black, 0.5),
    '&:hover': {
      backgroundColor: alpha(theme.palette.gx.darkGrey[700], 0.5)
    }
  }
});
