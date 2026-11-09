import { Box, Button, Typography } from '@mui/material';
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
          {t('settingsHelp.title')}
        </Typography>
        <Typography
          component="span"
          sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
        >
          {t(help.visible ? 'settingsHelp.hideShort' : 'settingsHelp.showShort')}
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
          {help.help?.title && <Typography sx={sx.controlTitle}>{help.help.title}</Typography>}
          <Box sx={{ fontSize: '0.875rem', lineHeight: 1.55, color: help.help ? 'text.primary' : 'text.secondary' }}>
            {help.help?.content ?? t('settingsHelp.prompt')}
          </Box>
        </Box>
      )}
    </Box>
  );
};
const sx = {
  panel: {
    flexShrink: 0,
    marginTop: '12px',
    borderTop: '1px solid',
    borderColor: 'divider',
    backgroundColor: 'background.paper',
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
    height: 'clamp(100px, 18vh, 160px)',
    overflowY: 'auto',
    padding: '4px 12px 12px',
    overflowWrap: 'anywhere',
    scrollbarWidth: 'thin'
  },
  controlTitle: { fontWeight: 700, fontSize: '0.875rem', marginBottom: '6px', lineHeight: 1.4 }
};
