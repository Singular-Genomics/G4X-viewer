import { AdditiveColormapExtension, DETAIL_VIEW_ID, getDefaultInitialViewState, LensExtension } from '@hms-dbmi/viv';
import { useChannelsStore } from '../../stores/ChannelsStore/ChannelsStore';
import { useShallow } from 'zustand/react/shallow';
import { DEFAULT_OVERVIEW, FILL_PIXEL_VALUE } from '../../shared/constants';
import { useViewerStore } from '../../stores/ViewerStore/ViewerStore';
import { Box } from '@mui/material';
import {
  useCellSegmentationLayer,
  useTranscriptLayer,
  useResizableContainer,
  useBrightfieldImageLayer,
  usePolygonDrawingLayer,
  usePolygonTextLayer
} from './PictureInPictureViewerAdapter.hooks';
import { useEffect, useRef } from 'react';
import { Tooltip } from '../Tooltip';
import { debounce } from 'lodash';
import { useBrightfieldImagesStore } from '../../stores/BrightfieldImagesStore';
import { useSnackbar } from 'notistack';
import { PolygonDrawingMenu } from '../PolygonDrawingMenu';
import { usePolygonDrawingStore } from '../../stores/PolygonDrawingStore';
import PictureInPictureViewer from '../PictureInPictureViewer';
import { useTranslation } from 'react-i18next';
import { VIEWER_LOADING_TYPES } from '../../stores/ViewerStore';
import { PictureInPictureViewerAdapterProps } from './PictureInPictureViewerAdapter.types';
import { makeBoundingBox } from '../ScaleBar/utils';

export const PictureInPictureViewerAdapter = ({ isViewerActive = true }: PictureInPictureViewerAdapterProps) => {
  const getLoader = useChannelsStore((store) => store.getLoader);
  const [brightfieldImageSource] = useBrightfieldImagesStore(useShallow((store) => [store.brightfieldImageSource]));
  const loader = getLoader();
  const { t } = useTranslation();
  const { containerRef, containerSize } = useResizableContainer();
  const cellMasksLayer = useCellSegmentationLayer();
  const transcriptLayer = useTranscriptLayer();
  const brightfieldImageLayer = useBrightfieldImageLayer();
  const polygonDrawingLayer = usePolygonDrawingLayer();
  const polygonTextLayer = usePolygonTextLayer();
  const deckGLRef = useRef<any>(null);
  const { enqueueSnackbar } = useSnackbar();

  const debouncedUpdateRef = useRef<any>(null);

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

  const [colormap, isLensOn, isOverviewOn, lensSelection, onViewportLoad, viewState, isViewerLoading] = useViewerStore(
    useShallow((store) => [
      store.colormap,
      store.isLensOn,
      store.isOverviewOn,
      store.lensSelection,
      store.onViewportLoad,
      store.viewState,
      store.isViewerLoading
    ])
  );

  const [isPolygonDrawingEnabled] = usePolygonDrawingStore(useShallow((store) => [store.isPolygonDrawingEnabled]));

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

  const drawScaleBarOnCanvas = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const physicalSize = loader[0]?.meta?.physicalSizes?.x;
    if (!viewState || !physicalSize) return;

    const boundingBox = makeBoundingBox(viewState);
    const barLength = (boundingBox[2][0] - boundingBox[0][0]) * 0.05;
    const barWidthInPixels = barLength * Math.pow(2, viewState.zoom);
    const text = `${parseFloat((barLength * (physicalSize.size || 1)).toPrecision(5)).toFixed(1)} ${physicalSize.unit || 'μm'}`;

    // Style constants
    const [padding, borderRadius, barHeight, fontSize, spacing] = [10, 12, 4, 16, 6];

    ctx.font = `${fontSize}px Roboto, sans-serif`;
    const boxWidth = Math.max(barWidthInPixels, ctx.measureText(text).width) + padding * 2;
    const boxHeight = barHeight + fontSize + spacing + padding * 2;
    const x = canvas.width - 55 - boxWidth;
    const y = canvas.height - 50 - boxHeight;

    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.roundRect(x, y, boxWidth, boxHeight, borderRadius);
    ctx.fill();

    // Draw scale bar with end caps
    const barX = x + (boxWidth - barWidthInPixels) / 2;
    const barY = y + padding;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(barX, barY, barWidthInPixels, barHeight);
    ctx.fillRect(barX, barY - 2, 2, barHeight + 4);
    ctx.fillRect(barX + barWidthInPixels - 2, barY - 2, 2, barHeight + 4);

    // Draw text
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(text, x + boxWidth / 2, y + padding + barHeight + spacing + fontSize);
  };

  const takeScreenshot = () => {
    try {
      const deck = deckGLRef.current?.deck;
      if (!deck?.canvas) throw new Error('DeckGL reference is not available');

      deck.redraw?.(true);

      const tempCanvas = document.createElement('canvas');
      const ctx = tempCanvas.getContext('2d');
      if (!ctx) throw new Error('Could not get canvas context');

      tempCanvas.width = deck.canvas.width;
      tempCanvas.height = deck.canvas.height;
      ctx.drawImage(deck.canvas, 0, 0);

      drawScaleBarOnCanvas(ctx, deck.canvas);

      const link = document.createElement('a');
      link.href = tempCanvas.toDataURL('image/png');
      link.download = `screenshot-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.png`;
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
    },
    controller: {
      doubleClickZoom: false
    }
  };

  if (brightfieldImageSource && !(isViewerLoading && isViewerLoading.type === VIEWER_LOADING_TYPES.BRIGHTFIELD_IMAGE)) {
    deckProps.layers = [brightfieldImageLayer, ...deckProps.layers];
  }

  if (polygonDrawingLayer) {
    deckProps.layers.push(polygonDrawingLayer as any);
  }

  if (polygonTextLayer) {
    deckProps.layers.push(polygonTextLayer as any);
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
            overviewOn={isOverviewOn && !isPolygonDrawingEnabled}
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
          <PolygonDrawingMenu
            takeScreenshot={takeScreenshot}
            isViewerActive={isViewerActive}
          />
          <Tooltip />
        </>
      )}
    </Box>
  );
};

const sx = {
  viewerContainer: {
    position: 'relative',
    width: '100%',
    height: '100%'
  }
};
