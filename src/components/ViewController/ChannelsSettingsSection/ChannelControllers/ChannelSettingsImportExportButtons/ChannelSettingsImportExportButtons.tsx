import { getConfigurationImportExportStyles } from '../../../../../shared/components/configurationImportExport.styles';
import { Box, Button, Tooltip, useTheme } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import { useTranslation } from 'react-i18next';
import { useChannelSettingsImportExport } from './useChannelSettingsImportExport.hook';

export const ChannelSettingsImportExportButtons = () => {
  const theme = useTheme();
  const sx = getConfigurationImportExportStyles(theme);
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
    ...sx.button,
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
          sx={sx.button}
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
