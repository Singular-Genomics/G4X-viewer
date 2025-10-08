import { useState } from 'react';
import { Box, IconButton, Theme, useTheme, alpha } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { useTranslation } from 'react-i18next';
import { GxDashboardGraphWindowProps } from './GxDashboardGraphWindow.types';
import { GxModal } from '../../shared/components/GxModal';

export const GxDashboardGraphWindow = ({
  controlsContent,
  settingsContent,
  graphContent
}: GxDashboardGraphWindowProps) => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
  };

  return (
    <Box sx={sx.container}>
      {controlsContent && <Box sx={sx.controlsBar}>{controlsContent}</Box>}
      {settingsContent && (
        <>
          <IconButton
            onClick={handleSettingsClick}
            size="small"
            sx={controlsContent ? sx.settingsButton : sx.settingsButton}
          >
            <SettingsIcon />
          </IconButton>
          <GxModal
            isOpen={isSettingsOpen}
            onClose={handleSettingsClose}
            title={t('dashboard.graphSettings')}
            colorVariant="singular"
            iconVariant="settings"
            size="small"
            hideButtons={true}
          >
            <Box sx={sx.settingsContent}>{settingsContent}</Box>
          </GxModal>
        </>
      )}

      <Box sx={sx.graphContent}>{graphContent}</Box>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    position: 'relative'
  },
  controlsBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 1,
    padding: '8px 12px',
    borderBottom: `1px solid ${alpha(theme.palette.gx.primary.white, 0.1)}`,
    flexShrink: 0,
    color: theme.palette.gx.primary.white
  },
  settingsButton: {
    position: 'absolute',
    top: '0px',
    right: '6px',
    color: theme.palette.gx.mediumGrey[500],
    zIndex: 10,
    '&:hover': {
      backgroundColor: alpha(theme.palette.gx.mediumGrey[300], 0.1)
    }
  },
  settingsContent: {
    minWidth: '400px',
    maxWidth: '600px'
  },
  graphContent: {
    flex: 1,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column'
  }
});
