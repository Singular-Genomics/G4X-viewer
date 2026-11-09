import { getConfigurationImportExportStyles } from '../../configurationImportExport.styles';
import { Box, Button, SxProps, Theme, Typography, useTheme } from '@mui/material';
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
    ...sx.button,
    ...(isDragActive && sx.importButtonActive),
    ...(isDragActive && isDragAccept && sx.importButtonAccept),
    ...(isDragActive && isDragReject && sx.importButtonReject)
  };

  return (
    <Box sx={sx.row}>
      <Typography sx={sx.colormapLabel}>{t('general.colormapConfig')}</Typography>
      <Box sx={sx.buttonsWrapper}>
        <Box sx={sx.buttonsContainer}>
          <Button
            startIcon={<DownloadIcon />}
            fullWidth
            sx={sx.button}
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
    </Box>
  );
};

const styles = (theme: Theme): Record<string, SxProps> => ({
  ...getConfigurationImportExportStyles(theme),
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingLeft: '8px',
    marginBottom: '8px'
  },
  colormapLabel: {
    fontWeight: 700,
    flexShrink: 0,
    whiteSpace: 'nowrap'
  },
  buttonsWrapper: {
    flex: 1,
    minWidth: 0,
    maxWidth: '200px',
    marginLeft: 'auto'
  }
});
