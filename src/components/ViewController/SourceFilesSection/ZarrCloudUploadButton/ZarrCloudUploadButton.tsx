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

  const handleSubmit = async (cloudImageUrl: string) => {
    const zarrDataSet = new ZarrDataSet(cloudImageUrl);

    if (!zarrDataSet.isValid()) {
      enqueueSnackbar({
        message: t('sourceFiles.zarrInvalidFile'),
        variant: 'error'
      });
      return;
    }

    const zarrDir = zarrDataSet.getZarrDirectoryName();
    const zarrMultiplexUrl = zarrDataSet.getMultiplexPath();

    useBinaryFilesStore.getState().reset();
    useTranscriptLayerStore.getState().reset();
    useCellSegmentationLayerStore.getState().reset();
    useBrightfieldImagesStore.getState().reset();

    useBinaryFilesStore.getState().setZarrUrl(cloudImageUrl);
    useBinaryFilesStore.getState().setFileName(zarrDir);

    const layerConfig = await zarrDataSet.detectLayerConfig();
    if (layerConfig) {
      useBinaryFilesStore.getState().setLayerConfig(layerConfig);
    }

    const newSource = {
      urlOrFile: zarrMultiplexUrl,
      description: zarrDir
    };

    useViewerStore.setState({ source: newSource });

    const metadata = await zarrDataSet.fetchRunMetadata();
    if (metadata) {
      useViewerStore.getState().setGeneralDetails({
        fileName: '.zattrs',
        data: metadata
      });
    }

    const hAndEUrl = zarrDataSet.getHAndEPath();
    useBrightfieldImagesStore.getState().addNewFile(hAndEUrl);

    try {
      const cellsData = await zarrDataSet.fetchCellsData();

      // Use protein names from Zarr, fallback to metadata if needed
      let proteinNames = cellsData.metadata.proteinNames;
      if (proteinNames.length === 0 && metadata) {
        const { extractProteinNamesFromMetadata } = await import('../../../../utils/ZarrCellsLoader');
        proteinNames = await extractProteinNamesFromMetadata(metadata);
      }

      // Check if UMAP data is available
      const hasUmapData = cellsData.cellMasks.some(
        (mask) => mask.umapValues.umapX !== 0 || mask.umapValues.umapY !== 0
      );

      useCellSegmentationLayerStore.setState({
        cellMasksData: cellsData.cellMasks,
        cellColormapConfig: cellsData.colormap,
        fileName: zarrDir,
        umapDataAvailable: hasUmapData,
        segmentationMetadata: {
          ...cellsData.metadata,
          proteinNames
        }
      });

      enqueueSnackbar({
        message: t('sourceFiles.segmentationSuccess', {
          count: cellsData.cellMasks.length,
          filename: zarrDir
        }),
        variant: 'success'
      });
    } catch (error) {
      console.error('Failed to load cell segmentation from Zarr:', error);
      enqueueSnackbar({
        message: t('sourceFiles.segmentationLoadError'),
        variant: 'warning'
      });
    }

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
