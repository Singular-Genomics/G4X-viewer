import { Box, Theme, Typography, alpha, useMediaQuery, useTheme } from '@mui/material';
import { useViewerStore } from '../../stores/ViewerStore/ViewerStore';
import { PictureInPictureViewerAdapter } from '../../components/PictureInPictureViewerAdapter/PictureInPictureViewerAdapter';
import { SIDE_PANEL_DEFAULT_WIDTH, ViewController } from '../../components/ViewController';
import { useShallow } from 'zustand/react/shallow';
import { GxLoader } from '../../shared/components/GxLoader';
import { useProteinImage } from '../../hooks/useProteinImage.hook';
import { ImageInfo } from '../../components/ImageInfo/ImageInfo';
import { useBrightfieldImage } from '../../hooks/useBrightfieldImage.hook';
import { useBrightfieldImagesStore } from '../../stores/BrightfieldImagesStore';
import { DetailsPopup } from '../../components/DetailsPopup';
import { SummaryButton } from '../../components/SummaryButton';
import { ShareSettingsButton } from '../../components/ShareSettingsButton';
import { ActiveFiltersPanel } from '../../components/ActiveFiltersPanel';
import { useTranslation } from 'react-i18next';
import { VIEWER_LOADING_TYPES } from '../../stores/ViewerStore';
import { ViewerViewProps } from './ViewerView.types';
import { MobileWelcomeModal } from '../../components/MobileWelcomeModal';
import { useCloudImageLoader } from '../../hooks/useCloudImageLoader.hook';
import { ViewerLoadingBar } from '../../components/ViewerLoadingBar';
import { useCellSegmentationLayerStore } from '../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { MobileLayerControls } from '../../components/MobileLayerControls';
import { useOnDemandDataLoader } from '../../hooks/useOnDemandDataLoader.hook';
import { useState } from 'react';

// Delay prevents loader flicker for very short transcript tile requests.
const TRANSCRIPT_TILES_LOADING_DELAY_MS = 150;

export const ViewerView = ({ className, isViewerActive = true, isUiHidden = false }: ViewerViewProps) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const sx = styles(theme);
  const { t } = useTranslation();
  // Lives here because ViewController unmounts when the UI is hidden.
  const [sidePanelWidth, setSidePanelWidth] = useState(SIDE_PANEL_DEFAULT_WIDTH);

  const [source, isViewerLoading, isTranscriptTilesLoading] = useViewerStore(
    useShallow((store) => [store.source, store.isViewerLoading, store.isTranscriptTilesLoading])
  );
  const [brightfieldImageSource] = useBrightfieldImagesStore(useShallow((store) => [store.brightfieldImageSource]));
  const [isCellLayerOn, cellMasksData] = useCellSegmentationLayerStore(
    useShallow((store) => [store.isCellLayerOn, store.cellMasksData])
  );

  useCloudImageLoader();
  useOnDemandDataLoader();

  useProteinImage(source);
  useBrightfieldImage(brightfieldImageSource);

  return (
    <Box
      sx={sx.viewerContainer}
      className={className}
    >
      <Box sx={sx.viewerWrapper}>
        <>
          {source && !(isViewerLoading && isViewerLoading.type === VIEWER_LOADING_TYPES.MAIN_IMAGE) ? (
            <>
              <PictureInPictureViewerAdapter
                isViewerActive={isViewerActive}
                isUiHidden={isUiHidden}
              />
              {!isUiHidden && <ImageInfo />}
              {!isUiHidden && !isDesktop && <MobileLayerControls />}
            </>
          ) : (
            !isUiHidden &&
            !isViewerLoading && (
              <Typography
                sx={sx.infoText}
                variant="h2"
              >
                {t('viewer.noImageInfo')}
              </Typography>
            )
          )}
          {!isUiHidden && isViewerLoading && (
            <Box sx={sx.loaderContainer}>
              <GxLoader version="light" />
              {isViewerLoading.message && (
                <Typography sx={sx.loadingText}>{`${isViewerLoading.message}...`}</Typography>
              )}
            </Box>
          )}
          {!isUiHidden && (
            <Box sx={sx.loadingBarsContainer}>
              <ViewerLoadingBar
                isLoading={isTranscriptTilesLoading}
                text={t('viewer.loadingTranscripts')}
                delayMs={TRANSCRIPT_TILES_LOADING_DELAY_MS}
              />
              <ViewerLoadingBar
                isLoading={isCellLayerOn && cellMasksData === null}
                text={t('viewer.loadingSegmentation')}
              />
            </Box>
          )}
          {!isUiHidden && isDesktop && <SummaryButton />}
          {!isUiHidden && isDesktop && <ShareSettingsButton />}
          {!isUiHidden && isDesktop && <DetailsPopup />}
        </>
      </Box>
      {!isUiHidden && isDesktop && (
        <ViewController
          imageLoaded={!!source}
          panelWidth={sidePanelWidth}
          onPanelWidthChange={setSidePanelWidth}
        />
      )}
      {!isUiHidden && <ActiveFiltersPanel />}
      {!isUiHidden && <MobileWelcomeModal />}
    </Box>
  );
};

const styles = (theme: Theme) => ({
  viewerContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    overflow: 'hidden'
  },
  viewerWrapper: {
    width: '100%',
    flex: 1,
    minWidth: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  loadingBarsContainer: {
    position: 'absolute',
    left: '50%',
    bottom: 12,
    transform: 'translateX(-50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    zIndex: 120
  },
  loaderContainer: {
    position: 'absolute',
    background: alpha(theme.palette.gx.darkGrey[700], 0.8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    padding: '32px',
    borderRadius: '32px',
    maxWidth: '100vw',
    boxSizing: 'border-box'
  },
  loadingText: {
    fontSize: '30px',
    color: '#FFF',
    textTransform: 'uppercase'
  },
  infoText: {
    color: theme.palette.gx.lightGrey[900],
    fontSize: '16px'
  }
});
