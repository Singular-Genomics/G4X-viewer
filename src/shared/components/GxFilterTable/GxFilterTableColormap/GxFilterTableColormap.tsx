import { alpha, Box, Button, SxProps, Theme, Typography, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import { useDropzone } from 'react-dropzone';
import { GxFilterTableColormapProps } from './GxFilterTableColormap.types';

export const GxFilterTableColormap = ({ onDrop, onExport }: GxFilterTableColormapProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const sx = styles(theme);

  const { getRootProps, getInputProps, isDragActive, isDragAccept, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json']
    },
    maxFiles: 1
  });

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
    <Box>
      <Typography sx={sx.label}>{t('general.colormapConfig')}:</Typography>
      <Box sx={sx.buttonsContainer}>
        <Button
          startIcon={<DownloadIcon />}
          fullWidth
          sx={sx.exportButton}
          onClick={onExport}
        >
          {t('general.export')}
        </Button>
        <Button
          startIcon={<UploadIcon />}
          sx={importButtonStyle}
          fullWidth
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          {dynamicButtonText}
        </Button>
      </Box>
    </Box>
  );
};

const styles = (theme: Theme): Record<string, SxProps> => ({
  buttonsContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '16px',
    marginBottom: '12px',
    width: '100%',
    padding: '0'
  },
  label: {
    fontWeight: 600,
    marginBottom: '4px'
  },
  exportButton: {
    background: theme.palette.gx.gradients.brand(),
    color: theme.palette.gx.primary.white,
    padding: '7px 16px',
    flex: 1
  },
  importButton: {
    borderStyle: 'dashed',
    color: theme.palette.gx.accent.greenBlue,
    border: '2px solid',
    borderColor: theme.palette.gx.accent.greenBlue,
    padding: '7px 16px',
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
