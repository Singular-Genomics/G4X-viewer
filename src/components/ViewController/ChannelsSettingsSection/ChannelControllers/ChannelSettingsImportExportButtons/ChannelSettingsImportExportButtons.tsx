import { Box, Button, SxProps, Theme, Tooltip, alpha, useTheme } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import { useTranslation } from 'react-i18next';
import { useChannelSettingsImportExport } from './useChannelSettingsImportExport.hook';

export const ChannelSettingsImportExportButtons = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();

  const { exportChannelSettings, getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } =
    useChannelSettingsImportExport();

  let dynamicButtonText = t('general.import');

  if (isDragActive) {
    if (isDragAccept) {
      dynamicButtonText = t('general.dropHere');
    } else if (isDragReject) {
      dynamicButtonText = t('general.invalidFile');
    } else {
      dynamicButtonText = t('general.dropFile');
    }
  }

  const importButtonStyle = {
    ...sx.importButton,
    ...(isDragActive && sx.importButtonActive),
    ...(isDragActive && isDragAccept && sx.importButtonAccept),
    ...(isDragActive && isDragReject && sx.importButtonReject)
  };

  return (
    <Box sx={sx.buttonsContainer}>
      <Tooltip
        title={t('tooltips.channelSettings.export')}
        arrow
        placement="top"
      >
        <Button
          startIcon={<DownloadIcon />}
          onClick={exportChannelSettings}
          sx={sx.exportButton}
          fullWidth
        >
          {t('general.export')}
        </Button>
      </Tooltip>
      <Tooltip
        title={t('tooltips.channelSettings.import')}
        arrow
        placement="top"
      >
        <Button
          startIcon={<UploadIcon />}
          sx={importButtonStyle}
          fullWidth
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          {dynamicButtonText}
        </Button>
      </Tooltip>
    </Box>
  );
};

const styles = (theme: Theme): Record<string, SxProps> => ({
  buttonsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '8px',
    width: '100%',
    '& .MuiButton-root': {
      height: '36px',
      minWidth: 0,
      padding: '4px 6px',
      fontSize: '0.75rem',
      whiteSpace: 'nowrap',
      '& .MuiButton-startIcon': {
        marginLeft: 0,
        marginRight: '4px',
        '& > *': { fontSize: '16px' }
      }
    }
  },
  exportButton: {
    background: theme.palette.gx.gradients.brand(),
    color: theme.palette.common.white,
    flex: 1
  },
  importButton: {
    borderStyle: 'dashed',
    color: theme.palette.gx.accent.greenBlue,
    border: '2px solid',
    borderColor: theme.palette.gx.accent.greenBlue,
    flex: 1
  },
  importButtonActive: {
    borderStyle: 'solid',
    borderWidth: '2px',
    backgroundColor: alpha(theme.palette.gx.accent.greenBlue, 0.1)
  },
  importButtonAccept: {
    borderColor: theme.palette.success.main,
    color: theme.palette.success.main,
    backgroundColor: alpha(theme.palette.success.main, 0.1)
  },
  importButtonReject: {
    borderColor: theme.palette.error.main,
    color: theme.palette.error.main,
    backgroundColor: alpha(theme.palette.error.main, 0.1)
  }
});
