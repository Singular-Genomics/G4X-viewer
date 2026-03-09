import { Box, LinearProgress, Theme, Typography, alpha, useMediaQuery, useTheme } from '@mui/material';
import { useViewerStore } from '../../stores/ViewerStore';
import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';

// Delay prevents loader flicker for very short transcript tile requests.
const SHOW_DELAY_MS = 150;

export const TranscriptTilesLoadingBar = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const sx = styles(theme);

  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('md'));
  const isTranscriptTilesLoading = useViewerStore((store) => store.isTranscriptTilesLoading);
  const [isVisible, setIsVisible] = useState(false);
  const showTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (showTimeoutRef.current) {
      window.clearTimeout(showTimeoutRef.current);
      showTimeoutRef.current = null;
    }

    if (isTranscriptTilesLoading) {
      showTimeoutRef.current = window.setTimeout(() => {
        setIsVisible(true);
        showTimeoutRef.current = null;
      }, SHOW_DELAY_MS);
      return;
    }

    setIsVisible(false);

    return () => {
      if (showTimeoutRef.current) {
        window.clearTimeout(showTimeoutRef.current);
      }
    };
  }, [isTranscriptTilesLoading]);

  if (!isVisible) {
    return null;
  }

  return (
    <Box sx={sx.loadingContainer}>
      {!isMobileOrTablet && <Typography sx={sx.loadingText}>{t('viewer.loadingTranscripts')}</Typography>}
      <LinearProgress sx={sx.loadingProgress} />
    </Box>
  );
};

const styles = (theme: Theme) => ({
  loadingContainer: {
    position: 'absolute',
    left: '50%',
    bottom: 12,
    transform: 'translateX(-50%)',
    width: {
      xs: '20vw',
      md: 260
    },
    minWidth: {
      xs: 72,
      md: 'unset'
    },
    maxWidth: {
      xs: 120,
      md: 'unset'
    },
    padding: {
      xs: 0,
      md: '8px 10px'
    },
    borderRadius: {
      xs: 0,
      md: '8px'
    },
    backgroundColor: {
      xs: 'transparent',
      md: alpha(theme.palette.gx.primary.black, 0.6)
    },
    display: 'flex',
    flexDirection: 'column',
    gap: {
      xs: 0,
      md: '6px'
    },
    zIndex: 120
  },
  loadingText: {
    color: theme.palette.gx.primary.white,
    fontSize: '13px',
    fontWeight: 500,
    lineHeight: 1
  },
  loadingProgress: {
    height: {
      xs: 3,
      md: 4
    },
    borderRadius: '999px',
    backgroundColor: alpha(theme.palette.gx.primary.white, 0.25),
    '& .MuiLinearProgress-bar': {
      backgroundColor: theme.palette.gx.accent.greenBlue,
      borderRadius: '999px'
    }
  }
});
