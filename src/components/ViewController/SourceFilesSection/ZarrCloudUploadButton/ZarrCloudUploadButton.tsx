import { Box, TextField, Theme, useTheme, Button, alpha, SxProps } from '@mui/material';
import { useViewerStore } from '../../../../stores/ViewerStore';
import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { useBinaryFilesStore } from '../../../../stores/BinaryFilesStore';
import { useTranscriptLayerStore } from '../../../../stores/TranscriptLayerStore';
import { useCellSegmentationLayerStore } from '../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useBrightfieldImagesStore } from '../../../../stores/BrightfieldImagesStore';
import { CloudBasedModal } from '../../CloudBasedModal/CloudBasedModal';
import { useTranslation } from 'react-i18next';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { ZarrDataSet } from '../../../../utils/ZarrDataSet';

export default function ZarrCloudUploadButton() {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [cloudImageUrl, setCloudImageUrl] = useState('');

  const imageName = useViewerStore((store) => store.source?.description);
  const { enqueueSnackbar } = useSnackbar();

  const handleCloudUploadClick = () => {
    setIsPopupOpen(true);
  };

  const handleClose = () => {
    setIsPopupOpen(false);
  };

  const handleSubmit = (cloudImageUrl: string) => {
    const zarrDataSet = new ZarrDataSet(cloudImageUrl);

    if (!zarrDataSet.isValid()) {
      enqueueSnackbar({
        message: t('sourceFiles.zarrInvalidFile'),
        variant: 'error'
      });
      return;
    }

    const zarrDir = zarrDataSet.getZarrDirectoryName();
    const zarrImagesUrl = zarrDataSet.getImagesPath();

    const newSource = {
      urlOrFile: zarrImagesUrl,
      description: zarrDir
    };

    useViewerStore.setState({ source: newSource });
    useBinaryFilesStore.getState().reset();
    useTranscriptLayerStore.getState().reset();
    useCellSegmentationLayerStore.getState().reset();
    useBrightfieldImagesStore.getState().reset();

    setCloudImageUrl(cloudImageUrl);
    setIsPopupOpen(false);

    enqueueSnackbar({
      message: t('sourceFiles.zarrSuccess', { filename: zarrDir }),
      variant: 'success'
    });
  };

  return (
    <Box>
      <TextField
        variant="filled"
        label={t('sourceFiles.zarrInputLabel')}
        size="small"
        fullWidth
        value={imageName || ' '}
        sx={sx.textField}
        disabled={false}
        slotProps={{
          htmlInput: { readOnly: true }
        }}
      />
      <Button
        fullWidth
        variant="outlined"
        sx={sx.cloudUploadButton}
        size="small"
        onClick={handleCloudUploadClick}
        startIcon={<CloudUploadIcon />}
      >
        {t('general.cloudUpload')}
      </Button>

      <CloudBasedModal
        isOpen={isPopupOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        url={cloudImageUrl}
        onUrlChange={setCloudImageUrl}
        title={t('general.cloudUpload')}
        placeholder={t('sourceFiles.zarrInputPlaceholder')}
        label={t('general.imageURL')}
      />
    </Box>
  );
}

const styles = (theme: Theme): Record<string, SxProps> => ({
  textField: {
    marginBottom: '8px',
    '& .MuiFormLabel-root.Mui-focused': {
      color: theme.palette.gx.accent.greenBlue
    },
    '& .MuiInputBase-input': {
      cursor: 'auto'
    },
    '& .MuiInputBase-root::after': {
      borderBottom: '2px solid',
      borderColor: theme.palette.gx.accent.greenBlue
    }
  },
  cloudUploadButton: {
    borderStyle: 'solid',
    width: '100%',
    height: '40px',
    fontWeight: 700,
    borderColor: theme.palette.gx.accent.greenBlue,
    color: theme.palette.gx.accent.greenBlue,
    '&:hover': {
      borderColor: theme.palette.gx.accent.greenBlue,
      backgroundColor: alpha(theme.palette.gx.accent.greenBlue, 0.2)
    },
    transition: 'background-color 0.15s ease, color 0.15s ease, border-color 0.15s ease'
  }
});
