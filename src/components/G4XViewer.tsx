import { Box, Theme, Typography, alpha, useTheme } from '@mui/material';
import { useViewerStore } from '../stores/ViewerStore/ViewerStore';
import { PictureInPictureViewerAdapter } from './PictureInPictureViewerAdapter/PictureInPictureViewerAdapter';

import { ViewController } from './ViewController';
import { LogoBanner } from './LogoBanner/LogoBanner';
import { useShallow } from 'zustand/react/shallow';
import { GxLoader } from '../shared/components/GxLoader';
import { useProteinImage } from '../hooks/useProteinImage.hook';
import { ImageInfo } from './ImageInfo/ImageInfo';
import { useBrightfieldImage } from '../hooks/useBrightfieldImage.hook';
import { useBrightfieldImagesStore } from '../stores/BrightfieldImagesStore';
import { DetailsPopup } from './DetailsPopup';

export default function G4XViewer() {
  const theme = useTheme();
  const sx = styles(theme);

  const [source, isViewerLoading] = useViewerStore(useShallow((store) => [store.source, store.isViewerLoading]));
  const [brightfieldImageSource, isImageLoading] = useBrightfieldImagesStore(
    useShallow((store) => [store.brightfieldImageSource, store.isImageLoading])
  );

  useProteinImage(source);
  useBrightfieldImage(brightfieldImageSource);

  return (
    <Box sx={sx.mainContainer}>
      <LogoBanner />
      <Box sx={sx.viewerWrapper}>
        <>
          {source && !isViewerLoading ? (
            <>
              <PictureInPictureViewerAdapter />
              <ImageInfo />
            </>
          ) : (
            !isImageLoading && (
              <Typography
                sx={sx.infoText}
                variant="h2"
              >
                Please upload an image file to view.
              </Typography>
            )
          )}
          {(isViewerLoading || isImageLoading) && (
            <Box sx={sx.loaderContainer}>
              <GxLoader version="light" />
              <Typography sx={sx.loadingText}>Loading Image...</Typography>
            </Box>
          )}
          <DetailsPopup />
        </>
      </Box>
      <ViewController imageLoaded={!!source} />
    </Box>
  );
}

const styles = (theme: Theme) => ({
  mainContainer: {
    background: `linear-gradient(0deg, ${theme.palette.gx.darkGrey[500]}, ${theme.palette.gx.darkGrey[100]})`,
    minHeight: '100vh',
    display: 'flex'
  },
  viewerWrapper: {
    width: '100%',
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
    borderRadius: '32px'
  },
  loadingText: {
    fontSize: '30px',
    color: '#FFF',
    textTransform: 'uppercase'
  },
  buttonGroup: {
    width: '300px',
    display: 'flex',
    justifyContent: 'space-between'
  },
  infoText: {
    color: theme.palette.gx.lightGrey[900],
    fontSize: '16px'
  }
});
