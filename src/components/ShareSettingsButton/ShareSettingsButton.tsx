import { IconButton, Theme, alpha, useTheme } from '@mui/material';
import LinkIcon from '@mui/icons-material/Link';
import { useTranslation } from 'react-i18next';
import { useSnackbar } from 'notistack';
import { useZarrDataStore } from '../../stores/ZarrDataStore';
import { serializeSettings } from '../../utils/urlSettings';
import { IMAGE_URL_PARAM } from '../../hooks/useCloudImageLoader.hook';

export const ShareSettingsButton = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const zarrUrl = useZarrDataStore((store) => store.zarrUrl);

  if (!zarrUrl) return null;

  const handleCopyLink = () => {
    const params = serializeSettings();
    params.set(IMAGE_URL_PARAM, zarrUrl);

    const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    navigator.clipboard.writeText(url).then(() => {
      enqueueSnackbar({
        message: t('general.shareLinkCopied'),
        variant: 'success'
      });
    });
  };

  return (
    <IconButton
      onClick={handleCopyLink}
      size="small"
      sx={sx.shareButton}
      title={t('general.shareSettings')}
    >
      <LinkIcon />
    </IconButton>
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
  }
});
