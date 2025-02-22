import { Box, Theme, Typography } from '@mui/material';
import { GxLogo } from '../../shared/components/GxLogo';

export const LogoBanner = () => (
  <Box sx={sx.logoBannerContainer}>
    <GxLogo version="light" />
    <Typography sx={sx.logoText}>G4X Viewer</Typography>
  </Box>
);

const sx = {
  logoBannerContainer: {
    position: 'absolute',
    zIndex: 1000,
    top: 10,
    left: 20,
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  logoText: {
    color: (theme: Theme) => theme.palette.gx.primary.white,
    fontWeight: 700,
    fontSize: '20px'
  }
};
