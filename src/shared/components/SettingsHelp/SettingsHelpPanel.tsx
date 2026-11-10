import { Box, Button, IconButton, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useId } from 'react';
import { useTranslation } from 'react-i18next';
import { useSettingsHelp } from './SettingsHelpContext';

export const SettingsHelpPanel = () => {
  const help = useSettingsHelp();
  const { t } = useTranslation();
  const contentId = useId();
  if (!help) return null;
  if (!help.visible)
    return (
      <IconButton
        onClick={help.toggleVisible}
        aria-expanded={false}
        aria-label={t('settingsHelp.show')}
        size="small"
        sx={sx.collapsedButton}
      >
        <InfoOutlinedIcon sx={{ fontSize: 18 }} />
      </IconButton>
    );
  return (
    <Box sx={sx.panel}>
      <Button
        onClick={help.toggleVisible}
        aria-expanded={help.visible}
        aria-controls={contentId}
        aria-label={t(help.visible ? 'settingsHelp.hide' : 'settingsHelp.show')}
        sx={sx.header}
      >
        <InfoOutlinedIcon sx={{ fontSize: 18 }} />
        <Typography
          component="span"
          sx={{ fontSize: '0.875rem', fontWeight: 700, flex: 1, textAlign: 'left' }}
        >
          {help.help?.title ?? t('settingsHelp.title')}
        </Typography>
        <ExpandMoreIcon sx={{ fontSize: 18, transform: help.visible ? 'rotate(0deg)' : 'rotate(180deg)' }} />
      </Button>
      {help.visible && (
        <Box
          id={contentId}
          role="region"
          aria-label={t('settingsHelp.title')}
          aria-live="polite"
          aria-atomic="true"
          sx={sx.content}
        >
          <Box
            sx={{
              fontSize: '0.875rem',
              lineHeight: 1.55,
              color: help.help ? 'text.primary' : 'text.secondary'
            }}
          >
            {help.help?.content ?? t('settingsHelp.prompt')}
          </Box>
        </Box>
      )}
    </Box>
  );
};
const sx = {
  collapsedButton: {
    position: 'absolute',
    bottom: '4px',
    right: '4px',
    width: 28,
    height: 28,
    color: 'text.secondary',
    zIndex: 1
  },
  panel: {
    flexShrink: 0,
    marginTop: '12px',
    borderTop: '1px solid',
    borderColor: 'divider',
    backgroundColor: 'background.level1',
    borderRadius: '6px'
  },
  header: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    minHeight: 36,
    padding: '6px 10px',
    color: 'text.primary',
    borderRadius: '6px'
  },
  content: {
    // Reduce the whole panel by 20%, accounting for its fixed 36px header.
    height: 'calc(clamp(80px, 14.4vh, 128px) - 7.2px)',
    overflowY: 'auto',
    padding: '4px 12px 12px',
    overflowWrap: 'anywhere',
    scrollbarWidth: 'thin'
  }
};
