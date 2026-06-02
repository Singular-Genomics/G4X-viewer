import { ColorPaletteExtension } from '@hms-dbmi/viv';
import { DETAIL_VIEW_ID, OVERVIEW_VIEW_ID, OverviewView, getDefaultInitialViewState, VivViewer } from '@hms-dbmi/viv';
import * as React from 'react';
import { PictureInPictureViewerProps } from './PictureInPictureViewer.types';
import DetailView from '../DetailView';
import { useImageOverlaysStore } from '../../stores/ImageOverlaysStore';
import { useShallow } from 'zustand/react/shallow';

export default function PictureInPictureViewer(props: PictureInPictureViewerProps) {
  const {
    loader,
    contrastLimits,
    colors,
    channelsVisible,
    viewStates: viewStatesProp,
    colormap,
    overview,
    overviewOn,
    selections,
    hoverHooks = { handleValue: () => {}, handleCoordnate: () => {} },
    height,
    width,
    lensEnabled = false,
    lensSelection = 0,
    lensRadius = 100,
    lensBorderColor = [255, 255, 255],
    lensBorderRadius = 0.02,
    clickCenter = true,
    transparentColor,
    snapScaleBar = false,
    onViewStateChange,
    onHover,
    onViewportLoad,
    extensions = [new ColorPaletteExtension()],
    deckProps
  } = props;
  const [
    brightfieldImageSource,
    isBrightfieldLayerVisible,
    getLoader,
    brightfieldContrastLimits,
    brightfieldColors,
    brightfieldSelections
  ] = useImageOverlaysStore(
    useShallow((store) => [
      store.brightfieldImageSource,
      store.isLayerVisible,
      store.getLoader,
      store.contrastLimits,
      store.colors,
      store.selections
    ])
  );

  const detailViewState = viewStatesProp?.find((v) => v.id === DETAIL_VIEW_ID);
  // biome-ignore lint/correctness/useExhaustiveDependencies: Carried over from eslint, without explanation.
  const baseViewState = React.useMemo(() => {
    return detailViewState || getDefaultInitialViewState(loader, { height, width }, 0.5);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loader, detailViewState]);

  const detailView = new DetailView({
    id: DETAIL_VIEW_ID,
    height,
    width,
    snapScaleBar
  } as any);

  const layerConfig = {
    loader,
    contrastLimits,
    colors,
    channelsVisible,
    selections,
    onViewportLoad,
    colormap,
    lensEnabled,
    lensSelection,
    lensRadius,
    lensBorderColor,
    lensBorderRadius,
    extensions,
    transparentColor
  };

  const views = [detailView];
  const layerProps = [layerConfig];
  const viewStates = [{ ...baseViewState, id: DETAIL_VIEW_ID }];
  const overviewSource =
    brightfieldImageSource && isBrightfieldLayerVisible
      ? {
          loader: getLoader(),
          contrastLimits: brightfieldContrastLimits as [number, number][],
          colors: brightfieldColors,
          channelsVisible: Array(brightfieldColors.length).fill(true),
          selections: brightfieldSelections
        }
      : { loader, contrastLimits, colors, channelsVisible, selections };

  if (overviewOn && overviewSource.loader?.[0]?.getRaster) {
    // It's unclear why this is needed because OverviewView.filterViewState sets "zoom" and "target".
    const overviewViewState = viewStatesProp?.find((v) => v.id === OVERVIEW_VIEW_ID) || {
      ...baseViewState,
      id: OVERVIEW_VIEW_ID
    };

    const overviewView = new OverviewView({
      id: OVERVIEW_VIEW_ID,
      loader: overviewSource.loader,
      detailHeight: height,
      detailWidth: width,
      clickCenter,
      ...overview
    } as any);

    views.push(overviewView as any);
    layerProps.push({
      ...layerConfig,
      ...overviewSource,
      lensEnabled: false
    });
    viewStates.push(overviewViewState as any);
  }

  if (!loader) return null;

  return (
    <VivViewer
      layerProps={layerProps as any}
      views={views as any}
      viewStates={viewStates as any}
      hoverHooks={hoverHooks as any}
      onViewStateChange={onViewStateChange as any}
      onHover={onHover as any}
      deckProps={deckProps}
    />
  );
}
