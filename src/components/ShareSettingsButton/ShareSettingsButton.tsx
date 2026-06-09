import { useState } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  TextField,
  Theme,
  Tooltip,
  Typography,
  alpha,
  useTheme
} from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { useZarrDataStore } from '../../stores/ZarrDataStore';
import { applyUrlSettings, serializeSettings } from '../../utils/urlSettings';
import { IMAGE_URL_PARAM } from '../../hooks/useCloudImageLoader.hook';
import { loadZarrFromUrl } from '../../utils/loadZarrFromUrl';

export const ShareSettingsButton = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const zarrUrl = useZarrDataStore((store) => store.zarrUrl);
  const zarrStoreFactory = useZarrDataStore((store) => store.zarrStoreFactory);

  const isLocalZarr = !zarrUrl && !!zarrStoreFactory;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [fullLinkInput, setFullLinkInput] = useState('');
  const [settingsInput, setSettingsInput] = useState('');

  if (!zarrUrl && !zarrStoreFactory) return null;

  const handleOpen = () => {
    const params = serializeSettings();
    if (zarrUrl) params.set(IMAGE_URL_PARAM, zarrUrl);
    setFullLinkInput(params.toString());
    setSettingsInput(serializeSettings().toString());
    setIsDialogOpen(true);
  };

  const handleClose = () => setIsDialogOpen(false);

  const handleCopyFull = () => {
    const fullUrl = `${window.location.origin}${window.location.pathname}?${fullLinkInput}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      enqueueSnackbar({ message: t('general.shareLinkCopied'), variant: 'success' });
    });
  };

  const handleCopySettings = () => {
    navigator.clipboard.writeText(settingsInput).then(() => {
      enqueueSnackbar({ message: t('general.shareLinkCopied'), variant: 'success' });
    });
  };

  const handleApplyFull = async () => {
    const params = new URLSearchParams(fullLinkInput);
    const imageUrl = params.get(IMAGE_URL_PARAM);
    if (!imageUrl) {
      enqueueSnackbar({ message: t('general.invalidURL'), variant: 'error' });
      return;
    }
    const { successMessages, warningMessages, errorMessage } = await loadZarrFromUrl({
      cloudImageUrl: imageUrl,
      t
    });
    if (errorMessage) {
      enqueueSnackbar({ message: errorMessage, variant: 'error' });
      return;
    }
    applyUrlSettings(params);
    warningMessages.forEach((message) => enqueueSnackbar({ message, variant: 'warning' }));
    successMessages.forEach((message) => enqueueSnackbar({ message, variant: 'success' }));
    handleClose();
  };

  const handleApplySettings = () => {
    applyUrlSettings(new URLSearchParams(settingsInput));
    enqueueSnackbar({ message: t('general.shareSettingsApplied'), variant: 'success' });
  };

  return (
    <Box>
      <IconButton
        onClick={handleOpen}
        size="small"
        sx={sx.shareButton}
        title={t('general.shareSettings')}
      >
        <LinkIcon />
      </IconButton>

      <Dialog
        open={isDialogOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        sx={sx.dialog}
      >
        <DialogTitle sx={sx.dialogTitle}>
          <Typography sx={sx.dialogTitleText}>{t('general.shareDialogTitle')}</Typography>
          <IconButton
            onClick={handleClose}
            sx={sx.dialogCloseButton}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={sx.dialogContent}>
          <Typography sx={sx.sectionLabel}>{t('general.shareFullLinkLabel')}</Typography>
          <Typography sx={sx.helperText}>
            {isLocalZarr ? t('general.shareFullLinkLocalDisabled') : t('general.shareFullLinkHelper')}
          </Typography>
          <Box sx={sx.inputRow}>
            <TextField
              fullWidth
              size="small"
              value={fullLinkInput}
              onChange={(e) => setFullLinkInput(e.target.value)}
              sx={sx.textField}
              disabled={isLocalZarr}
            />
            <Tooltip title={isLocalZarr ? t('general.shareFullLinkLocalDisabled') : ''}>
              <span>
                <IconButton
                  onClick={handleCopyFull}
                  size="small"
                  sx={sx.actionButton}
                  title={t('general.shareLinkCopied')}
                  disabled={isLocalZarr}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={isLocalZarr ? t('general.shareFullLinkLocalDisabled') : ''}>
              <span>
                <IconButton
                  onClick={handleApplyFull}
                  size="small"
                  sx={sx.actionButton}
                  title={t('general.shareFullLinkApplied')}
                  disabled={isLocalZarr}
                >
                  <CheckIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Box>

          <Divider sx={sx.divider} />

          <Typography sx={sx.sectionLabel}>{t('general.shareSettingsOnlyLabel')}</Typography>
          <Typography sx={sx.helperText}>{t('general.shareSettingsOnlyHelper')}</Typography>
          <Box sx={sx.inputRow}>
            <TextField
              fullWidth
              size="small"
              value={settingsInput}
              onChange={(e) => setSettingsInput(e.target.value)}
              sx={sx.textField}
            />
            <IconButton
              onClick={handleCopySettings}
              size="small"
              sx={sx.actionButton}
              title={t('general.shareLinkCopied')}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
            <IconButton
              onClick={handleApplySettings}
              size="small"
              sx={sx.actionButton}
              title={t('general.shareSettingsApplied')}
            >
              <CheckIcon fontSize="small" />
            </IconButton>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  shareButton: {
    position: 'absolute',
    top: '10px',
    right: '90px',
    color: theme.palette.gx.mediumGrey[300],
    '&:hover': {
      backgroundColor: alpha(theme.palette.gx.mediumGrey[300], 0.1)
    }
  },
  dialog: {
    '& .MuiDialog-paper': {
      backgroundColor: theme.palette.gx.primary.white
    }
  },
  dialogTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.palette.gx.accent.greenBlue,
    padding: '16px 24px'
  },
  dialogTitleText: {
    fontWeight: 700,
    fontSize: '1.25rem',
    color: theme.palette.gx.primary.white
  },
  dialogCloseButton: {
    color: theme.palette.gx.primary.white,
    '&:hover': {
      backgroundColor: alpha(theme.palette.gx.primary.white, 0.1)
    }
  },
  dialogContent: {
    padding: '24px !important',
    backgroundColor: theme.palette.gx.lightGrey[700]
  },
  sectionLabel: {
    fontWeight: 600,
    fontSize: '0.875rem',
    color: theme.palette.gx.primary.black,
    marginBottom: '4px'
  },
  helperText: {
    fontSize: '0.75rem',
    color: theme.palette.gx.mediumGrey[300],
    marginBottom: '8px'
  },
  inputRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  textField: {
    '& .MuiInputBase-root': {
      backgroundColor: theme.palette.gx.primary.white,
      fontSize: '0.8125rem'
    }
  },
  actionButton: {
    color: theme.palette.gx.mediumGrey[300],
    '&:hover': {
      backgroundColor: alpha(theme.palette.gx.mediumGrey[300], 0.1),
      color: theme.palette.gx.accent.greenBlue
    }
  },
  divider: {
    margin: '24px 0'
  }
});
