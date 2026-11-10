import { SettingsTooltip } from '../../../../shared/components/SettingsHelp';
import { SvgIcon, TextField, Theme, useTheme, InputAdornment, IconButton, SxProps } from '@mui/material';
import { useState, useRef, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';
import ClearIcon from '@mui/icons-material/Clear';
import SendIcon from '@mui/icons-material/Send';
import { useConsolidatedSnackbar } from '../../../../hooks/useConsolidatedSnackbar.hook.tsx';
import { IMAGE_URL_PARAM } from '../../../../hooks/useCloudImageLoader.hook';
import { loadZarrFromUrl } from '../../../../utils/loadZarrFromUrl';
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

    window.history.replaceState({}, '', window.location.pathname);

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
    <SettingsTooltip
      title={t('settingsHelp.controls.url')}
      helpTitle={t('sourceFiles.zarrInputLabel')}
    >
      <TextField
        variant="filled"
        hiddenLabel
        size="small"
        fullWidth
        value={cloudImageUrl}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t('sourceFiles.zarrInputLabel')}
        sx={sx.textField}
        slotProps={{
          htmlInput: { 'aria-label': t('sourceFiles.zarrInputLabel') },
          input: {
            endAdornment,
            inputRef,
            startAdornment: (
              <InputAdornment position="start">
                <SvgIcon
                  viewBox="0 -960 960 960"
                  sx={sx.cloudIcon}
                >
                  <path d="M260-160q-91 0-155.5-63T40-377q0-78 47-139t123-78q25-92 100-149t170-57q117 0 198.5 81.5T760-520q69 8 114.5 59.5T920-340q0 75-52.5 127.5T740-160H260Zm0-80h480q42 0 71-29t29-71q0-42-29-71t-71-29h-60v-80q0-83-58.5-141.5T480-720q-83 0-141.5 58.5T280-520h-20q-58 0-99 41t-41 99q0 58 41 99t99 41Zm220-240Z" />
                </SvgIcon>
              </InputAdornment>
            )
          }
        }}
      />
    </SettingsTooltip>
  );
}

const styles = (theme: Theme): Record<string, SxProps> => ({
  textField: {
    '& .MuiFilledInput-root': {
      height: '42px',
      alignItems: 'center',
      borderRadius: '6px',
      overflow: 'hidden',
      backgroundColor: theme.palette.background.level1
    },
    '& .MuiFilledInput-input': {
      paddingTop: 0,
      paddingBottom: 0
    },
    '& .MuiFilledInput-root::before': {
      borderBottom: 'none'
    },
    '& .MuiFilledInput-root:hover:not(.Mui-disabled, .Mui-error)::before': {
      borderBottom: 'none'
    },
    '& .MuiFilledInput-root::after': {
      borderBottom: `2px solid ${theme.palette.primary.main}`,
      transform: 'translateX(-100%)',
      transition: 'transform 150ms ease'
    },
    '& .MuiFilledInput-root.Mui-focused::after': {
      transform: 'translateX(0)'
    }
  },
  cloudIcon: {
    fontSize: '18px',
    color: theme.palette.text.secondary
    // opacity: theme.vars?.opacity.inputPlaceholder ?? (theme.palette.mode === 'dark' ? 0.5 : 0.42)
  },
  iconButton: {
    color: theme.palette.text.secondary,
    padding: '2px',
    alignSelf: 'center',
    marginRight: '-4px'
  },
  iconSize: {
    fontSize: '18px'
  },
  clearIconSize: {
    fontSize: '20px'
  }
});
