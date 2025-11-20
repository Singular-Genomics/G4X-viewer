import { Box, Theme, Typography } from '@mui/material';
import { GxLogo } from '../../shared/components/GxLogo';
import { useTranslation } from 'react-i18next';

export const LogoBanner = () => {
  const { t } = useTranslation();
  return (
    <Box sx={sx.logoBannerContainer}>
      <GxLogo version="light" />
      <Typography sx={sx.logoText}>{t('general.appTitle')}</Typography>
    </Box>
  );
};

const sx = {
  logoBannerContainer: {
    position: 'absolute',
    zIndex: 50,
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
