import { Box, TextField, Theme, useTheme, Button, alpha, SxProps, List, ListItem, ListItemText } from '@mui/material';
import { useViewerStore } from '../../../../stores/ViewerStore';
import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { useZarrDataStore } from '../../../../stores/ZarrDataStore';
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

  const displayConsolidatedMessages = (messages: string[], variant: 'success' | 'warning', summaryKey: string) => {
    if (messages.length === 0) return;

    if (messages.length === 1) {
      enqueueSnackbar({
        message: messages[0],
        variant
      });
    } else {
      enqueueSnackbar({
        message: t(summaryKey),
        variant: 'gxSnackbar',
        titleMode: variant,
        customContent: (
          <List dense>
            {messages.map((msg, index) => (
              <ListItem key={index}>
                <ListItemText primary={msg} />
              </ListItem>
            ))}
          </List>
        )
      });
    }
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

    setCloudImageUrl(cloudImageUrl);
    setIsPopupOpen(false);

    useZarrDataStore.getState().reset();
    useTranscriptLayerStore.getState().reset();
    useCellSegmentationLayerStore.getState().reset();
    useBrightfieldImagesStore.getState().reset();

    useZarrDataStore.getState().setZarrUrl(cloudImageUrl);
    useZarrDataStore.getState().setFileName(zarrDir);

    const layerConfig = await zarrDataSet.detectLayerConfig();
    if (layerConfig) {
      useZarrDataStore.getState().setLayerConfig(layerConfig);
    }

    const transcriptColors = await zarrDataSet.fetchTranscriptColors();
    if (transcriptColors) {
      const colorMapEntries = Object.entries(transcriptColors).map(([gene_name, color]) => ({
        gene_name,
        color
      }));
      useZarrDataStore.getState().setColormapConfig(colorMapEntries);
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

    const successMessages: string[] = [];
    const warningMessages: string[] = [];

    try {
      const cellsData = await zarrDataSet.fetchCellsData();

      let proteinNames = cellsData.metadata.proteinNames;
      if (proteinNames.length === 0 && metadata) {
        try {
          const { extractProteinNamesFromMetadata } = await import('../../../../utils/ZarrCellsLoader');
          proteinNames = extractProteinNamesFromMetadata(metadata);
        } catch (error) {
          warningMessages.push(t('sourceFiles.proteinNamesExtractionError'));
        }
      }

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

      successMessages.push(
        t('sourceFiles.segmentationSuccess', {
          count: cellsData.cellMasks.length,
          filename: zarrDir
        })
      );
    } catch {
      warningMessages.push(t('sourceFiles.segmentationLoadError'));
    }

    successMessages.push(t('sourceFiles.zarrSuccess', { filename: zarrDir }));

    displayConsolidatedMessages(successMessages, 'success', 'sourceFiles.zarrLoadComplete');
    displayConsolidatedMessages(warningMessages, 'warning', 'sourceFiles.zarrLoadWarnings');
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
