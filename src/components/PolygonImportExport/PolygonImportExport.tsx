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
import { exportPolygonsWithCellsCSV, exportPolygonsWithTranscriptsCSV } from './PolygonImportExport.helpers';
import { useBinaryFilesStore } from '../../stores/BinaryFilesStore';
import { useCellSegmentationLayerStore } from '../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';

export const PolygonImportExport = ({
  exportPolygonsWithCells,
  exportPolygonsWithTranscripts,
  importPolygons,
  polygonFeatures
}: PolygonImportExportProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const theme = useTheme();
  const sx = styles(theme);
  const { enqueueSnackbar } = useSnackbar();

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
    setIsExportModalOpen(false);
  };

  const handleCsvExportTranscripts = () => {
    exportPolygonsWithTranscriptsCSV(polygonFeatures);
    setIsExportModalOpen(false);
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setSelectedFileName(file.name);
        setIsImporting(true);
        setIsImportModalOpen(false);

        enqueueSnackbar('Processing polygon import...', {
          variant: 'info',
          persist: false
        });

        try {
          await importPolygons(file);
          enqueueSnackbar('Polygons imported successfully!', {
            variant: 'success',
            persist: false
          });
        } catch (error) {
          console.error('Failed to import polygons:', error);
          enqueueSnackbar('Failed to import polygons. Please check the file format.', {
            variant: 'error',
            persist: false
          });
        } finally {
          setIsImporting(false);
          setSelectedFileName('');
        }
      }
    },
    [importPolygons, enqueueSnackbar]
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
          disabled={polygonFeatures.length === 0}
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
          disabled={isImporting}
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
                variant="outlined"
                onClick={handleCsvExportCells}
                sx={sx.csvButton}
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
                variant="outlined"
                onClick={handleCsvExportTranscripts}
                sx={sx.csvButton}
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
    '&:hover': {
      backgroundColor: alpha(theme.palette.gx.darkGrey[700], 0.5)
    },
    '&.Mui-disabled': {
      color: theme.palette.gx.darkGrey[500],
      backgroundColor: alpha(theme.palette.gx.primary.black, 0.3)
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
