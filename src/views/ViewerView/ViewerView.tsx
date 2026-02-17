import { Box, Theme, Typography, alpha, useMediaQuery, useTheme } from '@mui/material';
import { useViewerStore } from '../../stores/ViewerStore/ViewerStore';
import { PictureInPictureViewerAdapter } from '../../components/PictureInPictureViewerAdapter/PictureInPictureViewerAdapter';
import { ViewController } from '../../components/ViewController';
import { useShallow } from 'zustand/react/shallow';
import { GxLoader } from '../../shared/components/GxLoader';
import { useProteinImage } from '../../hooks/useProteinImage.hook';
import { ImageInfo } from '../../components/ImageInfo/ImageInfo';
import { useBrightfieldImage } from '../../hooks/useBrightfieldImage.hook';
import { useBrightfieldImagesStore } from '../../stores/BrightfieldImagesStore';
import { DetailsPopup } from '../../components/DetailsPopup';
import { ActiveFiltersPanel } from '../../components/ActiveFiltersPanel';
import { useTranslation } from 'react-i18next';
import { VIEWER_LOADING_TYPES } from '../../stores/ViewerStore';
import { ViewerViewProps } from './ViewerView.types';
import { useCloudImageLoader } from '../../hooks/useCloudImageLoader.hook';

export const ViewerView = ({ className, isViewerActive = true }: ViewerViewProps) => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const sx = styles(theme);
  const { t } = useTranslation();

  const [source, isViewerLoading] = useViewerStore(useShallow((store) => [store.source, store.isViewerLoading]));
  const [brightfieldImageSource] = useBrightfieldImagesStore(useShallow((store) => [store.brightfieldImageSource]));

  useCloudImageLoader();

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
              <PictureInPictureViewerAdapter isViewerActive={isViewerActive} />
              <ImageInfo />
            </>
          ) : (
            !isViewerLoading && (
              <Typography
                sx={sx.infoText}
                variant="h2"
              >
                {t('viewer.noImageInfo')}
              </Typography>
            )
          )}
          {isViewerLoading && (
            <Box sx={sx.loaderContainer}>
              <GxLoader version="light" />
              {isViewerLoading.message && (
                <Typography sx={sx.loadingText}>{`${isViewerLoading.message}...`}</Typography>
              )}
            </Box>
          )}
          <DetailsPopup />
        </>
      </Box>
      {isDesktop && <ViewController imageLoaded={!!source} />}
      <ActiveFiltersPanel />
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
