import { useState } from 'react';
import {
  Box,
  Button,
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
import ShareIcon from '@mui/icons-material/Share';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { useZarrDataStore } from '../../stores/ZarrDataStore';
import {
  applyCellFilterUrlSettings,
  applyCytometryFilterUrlSettings,
  applyTranscriptFilterUrlSettings,
  applyUrlSettings,
  serializeSettings
} from '../../utils/urlSettings';
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

  const buildFullUrl = (queryString: string) => `${window.location.origin}${window.location.pathname}?${queryString}`;

  const handleOpen = () => {
    const settings = serializeSettings();
    const params = new URLSearchParams();
    if (zarrUrl) params.set(IMAGE_URL_PARAM, zarrUrl);
    settings.forEach((value, key) => params.set(key, value));
    setFullLinkInput(isLocalZarr ? '' : buildFullUrl(params.toString()));
    setSettingsInput(settings.toString());
    setIsDialogOpen(true);
  };

  const handleClose = () => setIsDialogOpen(false);

  const handleCopyFull = () => {
    navigator.clipboard.writeText(fullLinkInput).then(() => {
      enqueueSnackbar({ message: t('general.shareLinkCopied'), variant: 'success' });
    });
  };

  const handleCopySettings = () => {
    navigator.clipboard.writeText(settingsInput).then(() => {
      enqueueSnackbar({ message: t('general.shareLinkCopied'), variant: 'success' });
    });
  };

  const handleApplyFull = async () => {
    let params: URLSearchParams;
    try {
      params = new URLSearchParams(new URL(fullLinkInput).search);
    } catch {
      enqueueSnackbar({ message: t('general.invalidURL'), variant: 'error' });
      return;
    }
    const imageUrl = params.get(IMAGE_URL_PARAM);
    if (!imageUrl) {
      enqueueSnackbar({ message: t('general.invalidURL'), variant: 'error' });
      return;
    }
    // Push params to browser URL so useProteinImage picks them up after image loads
    window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`);
    const { successMessages, warningMessages, errorMessage } = await loadZarrFromUrl({
      cloudImageUrl: imageUrl,
      t
    });
    if (errorMessage) {
      enqueueSnackbar({ message: errorMessage, variant: 'error' });
      return;
    }
    warningMessages.forEach((message) => enqueueSnackbar({ message, variant: 'warning' }));
    successMessages.forEach((message) => enqueueSnackbar({ message, variant: 'success' }));
    handleClose();
  };

  const handleApplySettings = () => {
    const params = new URLSearchParams(settingsInput);

    const imageUrl = new URLSearchParams(window.location.search).get(IMAGE_URL_PARAM);
    if (imageUrl) params.set(IMAGE_URL_PARAM, imageUrl);

    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);

    applyUrlSettings(params);
    applyCellFilterUrlSettings(params);
    applyTranscriptFilterUrlSettings(params);
    applyCytometryFilterUrlSettings(params);

    enqueueSnackbar({ message: t('general.shareSettingsApplied'), variant: 'success' });
    handleClose();
  };

  return (
    <Box>
      <Tooltip title={t('general.shareSettings')}>
        <IconButton
          onClick={handleOpen}
          size="small"
          sx={sx.shareButton}
          aria-label={t('general.shareSettings')}
        >
          <ShareIcon />
        </IconButton>
      </Tooltip>

      <Dialog
        open={isDialogOpen}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        sx={sx.dialog}
      >
        <DialogTitle sx={sx.dialogTitle}>
          <Typography sx={sx.dialogTitleText}>{t('general.shareSettings')}</Typography>
          <IconButton
            onClick={handleClose}
            sx={sx.dialogCloseButton}
            aria-label={t('general.closeShareSettings')}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={sx.dialogContent}>
          {!isLocalZarr && (
            <>
              <Typography sx={sx.sectionLabel}>{t('general.shareFullLinkLabel')}</Typography>
              <Typography sx={sx.helperText}>{t('general.shareFullLinkHelper')}</Typography>
              <Box sx={sx.inputRow}>
                <TextField
                  fullWidth
                  size="small"
                  value={fullLinkInput}
                  onChange={(e) => setFullLinkInput(e.target.value)}
                  sx={sx.textField}
                  slotProps={{ htmlInput: { 'aria-label': t('general.shareFullLinkLabel') } }}
                />
                <Tooltip title={t('general.copyFullLink')}>
                  <span>
                    <IconButton
                      onClick={handleCopyFull}
                      size="small"
                      sx={sx.actionButton}
                      aria-label={t('general.copyFullLink')}
                      disabled={!fullLinkInput.trim()}
                    >
                      <ContentCopyIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Button
                  onClick={handleApplyFull}
                  size="small"
                  variant="contained"
                  sx={sx.applyButton}
                  aria-label={t('general.applyFullLink')}
                  disabled={!fullLinkInput.trim()}
                >
                  {t('general.apply')}
                </Button>
              </Box>

              <Divider sx={sx.divider} />
            </>
          )}

          <Typography sx={sx.sectionLabel}>{t('general.shareSettingsOnlyLabel')}</Typography>
          <Typography sx={sx.helperText}>{t('general.shareSettingsOnlyHelper')}</Typography>
          <Box sx={sx.inputRow}>
            <TextField
              fullWidth
              size="small"
              value={settingsInput}
              onChange={(e) => setSettingsInput(e.target.value)}
              sx={sx.textField}
              slotProps={{ htmlInput: { 'aria-label': t('general.shareSettingsOnlyLabel') } }}
            />
            <Tooltip title={t('general.copySettings')}>
              <span>
                <IconButton
                  onClick={handleCopySettings}
                  size="small"
                  sx={sx.actionButton}
                  aria-label={t('general.copySettings')}
                  disabled={!settingsInput.trim()}
                >
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Button
              onClick={handleApplySettings}
              size="small"
              variant="contained"
              sx={sx.applyButton}
              aria-label={t('general.applySettings')}
              disabled={!settingsInput.trim()}
            >
              {t('general.apply')}
            </Button>
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
  applyButton: {
    alignSelf: 'stretch',
    minWidth: '72px',
    background: theme.palette.gx.gradients.brand(),
    color: theme.palette.gx.primary.white,
    fontWeight: 600,
    '&.Mui-disabled': {
      background: theme.palette.gx.mediumGrey[300],
      color: theme.palette.gx.primary.white
    }
  },
  divider: {
    margin: '24px 0'
  }
});
