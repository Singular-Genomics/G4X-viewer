import { Box, LinearProgress, Theme, Typography, alpha, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { ViewerLoadingBarProps } from './ViewerLoadingBar.types';

export const ViewerLoadingBar = ({ isLoading, text, delayMs = 0 }: ViewerLoadingBarProps) => {
  const theme = useTheme();
  const sx = styles(theme);
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsVisible(false);
      return;
    }

    if (delayMs <= 0) {
      setIsVisible(true);
      return;
    }

    const timeout = window.setTimeout(() => setIsVisible(true), delayMs);
    return () => window.clearTimeout(timeout);
  }, [isLoading, delayMs]);

  if (!isVisible) {
    return null;
  }

  return (
    <Box sx={sx.loadingContainer}>
      {!isMobileOrTablet && <Typography sx={sx.loadingText}>{text}</Typography>}
      <LinearProgress sx={sx.loadingProgress} />
    </Box>
  );
};

const styles = (theme: Theme) => ({
  loadingContainer: {
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
    }
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
