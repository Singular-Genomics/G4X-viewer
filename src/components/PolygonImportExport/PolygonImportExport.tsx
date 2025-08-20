import { Box, IconButton, Theme, alpha, useTheme, Button } from '@mui/material';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import MuiTooltip from '@mui/material/Tooltip';
import { useSnackbar } from 'notistack';
import { GxModal } from '../../shared/components/GxModal';
import { GxDropzoneButton } from '../../shared/components/GxDropzoneButton';
import { PolygonImportExportProps } from './PolygonImportExport.types';
import {
  exportPolygonsWithCellsCSV,
  exportPolygonsWithTranscriptsCSV,
  exportROIMetadataCSV
} from './PolygonImportExport.helpers';
import { useBinaryFilesStore } from '../../stores/BinaryFilesStore';
import { useCellSegmentationLayerStore } from '../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { usePolygonsFileImport } from './PolygonImportExport.hooks';

export const PolygonImportExport = ({
  exportPolygonsWithCells,
  exportPolygonsWithTranscripts,
  polygonFeatures,
  isDetecting = false
}: PolygonImportExportProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const theme = useTheme();
  const sx = styles(theme);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const importPolygons = usePolygonsFileImport();

  // Check if data is available
  const transcriptFiles = useBinaryFilesStore((store) => store.files);
  const cellMasksData = useCellSegmentationLayerStore((store) => store.cellMasksData);

  const hasTranscriptData = transcriptFiles.length > 0;
  const hasSegmentationData = cellMasksData && cellMasksData.length > 0;

  const handleImportClick = () => {
    setIsImportModalOpen(true);
  };

  const handleExportClick = () => {
    setIsExportModalOpen(true);
  };

  const handleJsonExportCells = () => {
    exportPolygonsWithCells();
    setIsExportModalOpen(false);
  };

  const handleJsonExportTranscripts = () => {
    exportPolygonsWithTranscripts();
    setIsExportModalOpen(false);
  };

  const handleCsvExportCells = () => {
    exportPolygonsWithCellsCSV(polygonFeatures);
    exportROIMetadataCSV(polygonFeatures);
    setIsExportModalOpen(false);
  };

  const handleCsvExportTranscripts = () => {
    exportPolygonsWithTranscriptsCSV(polygonFeatures);
    exportROIMetadataCSV(polygonFeatures);
    setIsExportModalOpen(false);
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setSelectedFileName(file.name);
        setIsImporting(true);
        setIsImportModalOpen(false);

        const loadingSnackbarId = enqueueSnackbar('Processing polygon import...', {
          variant: 'info',
          persist: true,
          key: 'polygon-import-loading'
        });

        try {
          await importPolygons(file);
          closeSnackbar(loadingSnackbarId);
          enqueueSnackbar('Polygons imported successfully!', {
            variant: 'success',
            autoHideDuration: 3000
          });
        } catch (error) {
          console.error('Failed to import polygons:', error);
          closeSnackbar(loadingSnackbarId);
          enqueueSnackbar('Failed to import polygons. Please check the file format.', {
            variant: 'error',
            autoHideDuration: 5000
          });
        } finally {
          setIsImporting(false);
          setSelectedFileName('');
        }
      }
    },
    [enqueueSnackbar, closeSnackbar, importPolygons]
  );

  const dropzoneProps = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json']
    },
    multiple: false
  });

  return (
    <Box sx={sx.container}>
      <MuiTooltip
        title="Export Polygons"
        placement="left"
      >
        <IconButton
          sx={sx.controlButton}
          onClick={handleExportClick}
          color="primary"
          disabled={polygonFeatures.length === 0 || isDetecting}
        >
          <FileDownloadIcon />
        </IconButton>
      </MuiTooltip>

      <MuiTooltip
        title="Import Polygons"
        placement="left"
      >
        <IconButton
          sx={sx.controlButton}
          onClick={handleImportClick}
          color="primary"
          disabled={isImporting || isDetecting}
        >
          <FileUploadIcon />
        </IconButton>
      </MuiTooltip>

      {/* Export Modal */}
      <GxModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        title="Export Polygons"
        colorVariant="singular"
        iconVariant="info"
        size="small"
      >
        <Box sx={sx.modalContent}>
          <Box sx={sx.exportGrid}>
            {/* Segmentation Row */}
            <Box sx={sx.exportRow}>
              <Button
                variant="contained"
                onClick={handleJsonExportCells}
                sx={sx.formatButton}
                fullWidth
                disabled={!hasSegmentationData}
              >
                JSON - Segmentation
              </Button>
              <Button
                variant="contained"
                onClick={handleCsvExportCells}
                sx={sx.formatButton}
                disabled={!hasSegmentationData}
                fullWidth
              >
                CSV - Segmentation
              </Button>
            </Box>

            {/* Transcripts Row */}
            <Box sx={sx.exportRow}>
              <Button
                variant="contained"
                onClick={handleJsonExportTranscripts}
                sx={sx.formatButton}
                fullWidth
                disabled={!hasTranscriptData}
              >
                JSON - Transcripts
              </Button>
              <Button
                variant="contained"
                onClick={handleCsvExportTranscripts}
                sx={sx.formatButton}
                disabled={!hasTranscriptData}
                fullWidth
              >
                CSV - Transcripts
              </Button>
            </Box>
          </Box>
        </Box>
      </GxModal>

      {/* Import Modal */}
      <GxModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Import Polygons"
        colorVariant="singular"
        iconVariant="info"
        size="small"
      >
        <Box sx={sx.modalContent}>
          <Box sx={sx.dropzoneWrapper}>
            <GxDropzoneButton
              labelTitle="Polygon Data File"
              labelText={selectedFileName || 'No file selected'}
              buttonText="Select JSON File"
              disabled={isImporting}
              {...dropzoneProps}
            />
          </Box>
        </Box>
      </GxModal>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 1
  },
  controlButton: {
    color: theme.palette.gx.lightGrey[300],
    backgroundColor: alpha(theme.palette.gx.primary.black, 0.5),
    transition: 'color 100ms ease-in-out',
    '&:hover': {
      backgroundColor: alpha(theme.palette.gx.darkGrey[700], 0.5)
    },
    '&.Mui-disabled': {
      color: theme.palette.gx.darkGrey[900],
      backgroundColor: alpha(theme.palette.gx.primary.black, 0.5)
    }
  },
  controlButtonDisabled: {
    color: theme.palette.gx.darkGrey[500],
    backgroundColor: alpha(theme.palette.gx.primary.black, 0.3),
    '&:hover': {
      backgroundColor: alpha(theme.palette.gx.primary.black, 0.3)
    },
    '&.Mui-disabled': {
      color: theme.palette.gx.darkGrey[500],
      backgroundColor: alpha(theme.palette.gx.primary.black, 0.3)
    }
  },
  modalContent: {
    width: '500px'
  },
  exportGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: '16px'
  },
  exportRow: {
    display: 'flex',
    gap: '12px'
  },
  formatButtonsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginBottom: '16px'
  },
  formatButton: {
    backgroundColor: theme.palette.gx.accent.greenBlue,
    color: theme.palette.gx.primary.white,
    '&:hover': {
      backgroundColor: alpha(theme.palette.gx.accent.greenBlue, 0.8)
    }
  },
  csvButton: {
    borderColor: theme.palette.gx.lightGrey[300],
    color: theme.palette.gx.lightGrey[300],
    '&:hover': {
      backgroundColor: alpha(theme.palette.gx.lightGrey[300], 0.1),
      borderColor: theme.palette.gx.lightGrey[300]
    }
  },
  dropzoneWrapper: {
    marginBottom: '16px'
  }
});
