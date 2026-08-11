import { TextField, Theme, useTheme, InputAdornment, IconButton, SxProps } from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import ClearIcon from '@mui/icons-material/Clear';
import SendIcon from '@mui/icons-material/Send';
import { useConsolidatedSnackbar } from '../../../../hooks/useConsolidatedSnackbar.hook.tsx';
import { IMAGE_URL_PARAM } from '../../../../hooks/useCloudImageLoader.hook';
import { loadZarrFromUrl } from '../../../../utils/loadZarrFromUrl';
import { useViewerStore } from '../../../../stores/ViewerStore';
import { useZarrDataStore } from '../../../../stores/ZarrDataStore';

const getInitialCloudImageUrl = () =>
  new URLSearchParams(window.location.search).get(IMAGE_URL_PARAM) || useZarrDataStore.getState().zarrUrl || '';

export default function ZarrSourceInput() {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [cloudImageUrl, setCloudImageUrl] = useState(getInitialCloudImageUrl);
  const [submitted, setSubmitted] = useState(!!getInitialCloudImageUrl());
  const imageName = useViewerStore((store) => store.source?.description);
  const zarrUrl = useZarrDataStore((store) => store.zarrUrl);
  const previousZarrUrlRef = useRef(zarrUrl);

  const { enqueueSnackbar } = useSnackbar();
  const { showConsolidatedMessages } = useConsolidatedSnackbar();

  // Skip initial render to keep a deep-linked ?imageUrl in the field
  useEffect(() => {
    if (previousZarrUrlRef.current === zarrUrl) return;
    previousZarrUrlRef.current = zarrUrl;
    setCloudImageUrl(zarrUrl ?? '');
    setSubmitted(!!zarrUrl);
  }, [zarrUrl]);

  const handleSubmit = async () => {
    if (!cloudImageUrl.trim()) return;

    const { successMessages, warningMessages, errorMessage } = await loadZarrFromUrl({
      cloudImageUrl,
      t
    });
    if (errorMessage) {
      enqueueSnackbar({ message: errorMessage, variant: 'error' });
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.delete(IMAGE_URL_PARAM);
    window.history.replaceState({}, '', url);

    setSubmitted(true);
    if (warningMessages.length === 0) {
      showConsolidatedMessages(successMessages, 'success', 'sourceFiles.zarrLoadComplete');
    }
    showConsolidatedMessages(warningMessages, 'warning', 'sourceFiles.zarrLoadWarnings');
  };

  const handleClear = () => {
    setCloudImageUrl('');
    inputRef.current?.focus();
  };

  const handleChange = (value: string) => {
    setCloudImageUrl(value);
    setSubmitted(false);
  };

  const handleKeyDown = (e: { key: string }) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') handleClear();
  };

  const endAdornment = cloudImageUrl ? (
    <InputAdornment position="end">
      {submitted ? (
        <IconButton
          size="small"
          onClick={handleClear}
          sx={sx.iconButton}
        >
          <ClearIcon sx={sx.clearIconSize} />
        </IconButton>
      ) : (
        <IconButton
          size="small"
          onClick={handleSubmit}
          sx={sx.iconButton}
        >
          <SendIcon sx={sx.iconSize} />
        </IconButton>
      )}
    </InputAdornment>
  ) : null;

  return (
    <TextField
      variant="filled"
      label={t('sourceFiles.zarrInputLabel')}
      size="small"
      fullWidth
      value={cloudImageUrl}
      onChange={(e) => handleChange(e.target.value)}
      onKeyDown={handleKeyDown}
      placeholder={t('sourceFiles.zarrInputPlaceholder')}
      helperText={imageName && (!cloudImageUrl || submitted) ? `${t('sourceFiles.zarrFileName')}: ${imageName}` : ' '}
      sx={sx.textField}
      slotProps={{ input: { endAdornment, inputRef } }}
    />
  );
}

const styles = (theme: Theme): Record<string, SxProps> => ({
  textField: {
    '& .MuiFormLabel-root.Mui-focused': {
      color: theme.palette.gx.accent.greenBlue
    },
    '& .MuiInputBase-root::after': {
      borderBottom: '2px solid',
      borderColor: theme.palette.gx.accent.greenBlue
    },
    '& .MuiFormHelperText-root': {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontSize: '0.8rem',
      color: theme.palette.gx.primary.black
    }
  },
  iconButton: {
    color: theme.palette.gx.primary.black,
    padding: '2px',
    alignSelf: 'center',
    marginTop: '12px',
    marginRight: '-4px'
  },
  iconSize: {
    fontSize: '18px'
  },
  clearIconSize: {
    fontSize: '20px'
  }
});
