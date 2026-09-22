import { SxProps, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GxModal } from '../../shared/components/GxModal';

const MOBILE_WELCOME_FLAG = 'disableMobileWelcomeModal_DSA';

export const MobileWelcomeModal = () => {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(() => !isDesktop && !localStorage.getItem(MOBILE_WELCOME_FLAG));

  if (isDesktop) return null;

  const handleClose = () => {
    localStorage.setItem(MOBILE_WELCOME_FLAG, 'true');
    setIsOpen(false);
  };

  return (
    <GxModal
      isOpen={isOpen}
      onContinue={handleClose}
      title={t('navigation.mobilePreview')}
      colorVariant="singular"
      iconVariant="info"
      size="small"
      hideCancel
    >
      <Typography sx={sx.modalLabel}>{t('navigation.mobilePreviewTooltip')}</Typography>
      <Typography sx={sx.modalLabel}>{t('viewer.mobileWelcomeDesktopHint')}</Typography>
    </GxModal>
  );
};

const sx: Record<string, SxProps> = {
  modalLabel: {
    fontSize: '14px'
  }
};
