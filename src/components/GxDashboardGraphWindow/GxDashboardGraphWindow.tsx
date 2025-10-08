import { useState } from 'react';
import { Box, IconButton, Modal, Theme, useTheme, alpha } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { GxDashboardGraphWindowProps } from './GxDashboardGraphWindow.types';

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
          <Modal
            open={isSettingsOpen}
            onClose={handleSettingsClose}
            sx={sx.modal}
          >
            <Box sx={sx.settingsContainer}>
              <Box sx={sx.settingsHeader}>
                <Box sx={sx.title}>{t('dashboard.graphSettings')}</Box>
                <IconButton
                  onClick={handleSettingsClose}
                  size="small"
                  sx={sx.closeButton}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
              {settingsContent}
            </Box>
          </Modal>
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
  closeButton: {
    color: theme.palette.gx.darkGrey[300],
    padding: '4px',
    '&:hover': {
      backgroundColor: alpha(theme.palette.gx.darkGrey[300], 0.1)
    }
  },
  modal: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  settingsContainer: {
    backgroundColor: theme.palette.gx.lightGrey[100],
    borderRadius: '10px',
    padding: '14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    minWidth: '400px',
    maxWidth: '600px',
    maxHeight: '80vh',
    overflow: 'auto',
    position: 'relative',
    '&:focus-visible': {
      outline: 'none'
    }
  },
  settingsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px'
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: 600
  },
  graphContent: {
    flex: 1,
    overflow: 'auto',
    display: 'flex',
    flexDirection: 'column'
  }
});
