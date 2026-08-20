import {
  Box,
  IconButton,
  Theme,
  useTheme,
  alpha,
  Dialog,
  DialogContent,
  DialogTitle,
  Typography,
  Button,
  CircularProgress
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { useEffect, useRef, useState } from 'react';
import { useZarrDataStore } from '../../stores/ZarrDataStore';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';

export const SummaryButton = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const [summaryUrl, setSummaryUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const summaryUrlRef = useRef<string | null>(null);
  const loadRequestIdRef = useRef(0);

  const zarrDataSet = useZarrDataStore((store) => store.zarrDataSet);

  const replaceSummaryUrl = (newUrl: string | null) => {
    const previousUrl = summaryUrlRef.current;
    summaryUrlRef.current = newUrl;
    setSummaryUrl(newUrl);
    if (previousUrl) URL.revokeObjectURL(previousUrl);
  };

  useEffect(
    () => () => {
      loadRequestIdRef.current += 1;
      if (summaryUrlRef.current) URL.revokeObjectURL(summaryUrlRef.current);
    },
    []
  );

  if (!zarrDataSet) return null;

  const handleSummaryClick = async () => {
    const requestId = ++loadRequestIdRef.current;
    setIsSummaryDialogOpen(true);
    setIsLoading(true);
    setLoadError(null);
    replaceSummaryUrl(null);

    try {
      const summaryBlob = await zarrDataSet.fetchSummaryHtmlBlob();
      if (requestId !== loadRequestIdRef.current) return;

      if (summaryBlob) {
        replaceSummaryUrl(URL.createObjectURL(summaryBlob));
      } else {
        const message = t('general.summaryUnavailableError');
        setIsLoading(false);
        setLoadError(message);
        enqueueSnackbar({
          variant: 'gxSnackbar',
          titleMode: 'error',
          message
        });
      }
    } catch (error) {
      if (requestId !== loadRequestIdRef.current) return;
      console.error('Failed to load summary report:', error);
      const message = t('general.summaryLoadError');
      setIsLoading(false);
      setLoadError(message);
      enqueueSnackbar({
        variant: 'gxSnackbar',
        titleMode: 'error',
        message
      });
    }
  };

  const handleSummaryClose = () => {
    loadRequestIdRef.current += 1;
    setIsSummaryDialogOpen(false);
    replaceSummaryUrl(null);
    setIsLoading(false);
    setLoadError(null);
  };

  const handleOpenInNewTab = () => {
    if (!summaryUrl || isLoading) return;
    const newTab = window.open(summaryUrl, '_blank');
    if (newTab) newTab.opener = null;
  };

  return (
    <Box>
      <IconButton
        onClick={handleSummaryClick}
        size="small"
        sx={sx.summaryButton}
      >
        <DescriptionIcon />
      </IconButton>

      <Dialog
        open={isSummaryDialogOpen}
        onClose={handleSummaryClose}
        maxWidth="xl"
        fullWidth
        sx={sx.dialog}
      >
        <DialogTitle sx={sx.dialogTitle}>
          <Typography sx={sx.dialogTitleText}>{t('general.summaryReport')}</Typography>
          <Box sx={sx.dialogTitleActions}>
            <Button
              onClick={handleOpenInNewTab}
              disabled={isLoading || !summaryUrl}
              startIcon={<OpenInNewIcon />}
              sx={sx.openInNewTabButton}
              size="small"
            >
              {t('general.openInNewTab')}
            </Button>
            <IconButton
              onClick={handleSummaryClose}
              sx={sx.dialogCloseButton}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={sx.dialogContent}>
          {isLoading && (
            <Box sx={sx.loadingContainer}>
              <CircularProgress
                size={60}
                sx={{ color: theme.palette.gx.accent.greenBlue }}
              />
            </Box>
          )}
          {loadError && (
            <Box sx={sx.errorContainer}>
              <Typography>{loadError}</Typography>
            </Box>
          )}
          {summaryUrl && (
            <iframe
              src={summaryUrl}
              style={{
                width: '100%',
                height: 'calc(100% + 2px)',
                marginBottom: '-2px',
                border: 'none',
                opacity: isLoading ? 0 : 1,
                transition: 'opacity 0.3s ease-in-out'
              }}
              onLoad={() => setIsLoading(false)}
              title={t('general.summaryReport')}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  summaryButton: {
    position: 'absolute',
    top: '10px',
    right: '50px',
    color: theme.palette.gx.mediumGrey[300],
    '&:hover': {
      backgroundColor: alpha(theme.palette.gx.mediumGrey[300], 0.1)
    }
  },
  dialog: {
    '& .MuiDialog-paper': {
      backgroundColor: theme.palette.gx.primary.white,
      maxHeight: '95vh',
      height: '95vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }
  },
  dialogTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.palette.gx.accent.greenBlue,
    color: theme.palette.gx.primary.white,
    fontWeight: 700,
    padding: '16px 24px',
    flexShrink: 0
  },
  dialogTitleText: {
    fontWeight: 700,
    fontSize: '1.25rem',
    color: theme.palette.gx.primary.white
  },
  dialogTitleActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  openInNewTabButton: {
    color: theme.palette.gx.primary.white,
    borderColor: theme.palette.gx.primary.white,
    '&:hover': {
      borderColor: theme.palette.gx.primary.white,
      backgroundColor: alpha(theme.palette.gx.primary.white, 0.1)
    },
    '&.Mui-disabled': {
      color: alpha(theme.palette.gx.primary.white, 0.45)
    }
  },
  dialogCloseButton: {
    color: theme.palette.gx.primary.white,
    '&:hover': {
      backgroundColor: alpha(theme.palette.gx.primary.white, 0.1)
    }
  },
  dialogContent: {
    padding: '0 !important',
    overflow: 'hidden',
    flex: 1,
    backgroundColor: theme.palette.gx.lightGrey[100]
  },
  loadingContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.palette.gx.lightGrey[100]
  },
  errorContainer: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    textAlign: 'center',
    color: theme.palette.gx.darkGrey[300]
  }
});
