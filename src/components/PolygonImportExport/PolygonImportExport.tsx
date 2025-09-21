import { Box, IconButton, Theme, alpha, useTheme, Button, FormControlLabel, Typography, SxProps } from '@mui/material';
import { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import PieChartRoundedIcon from '@mui/icons-material/PieChartRounded';
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
import { generatePolygonCellsData } from '../../stores/PolygonDrawingStore/PolygonDrawingStore.helpers';
import { useCellSegmentationLayerStore } from '../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { usePolygonsFileImport } from './PolygonImportExport.hooks';
import { useTranscriptLayerStore } from '../../stores/TranscriptLayerStore';
import { useTranslation } from 'react-i18next';
import { GxCheckbox } from '../../shared/components/GxCheckbox';
import { PlotSelectionTable } from '../ROIGenesSelectionTable';
import { creatPlots } from '../ROIplot/ROIplot.helpers';
import { ROIData } from '../../stores/PolygonDrawingStore/PolygonDrawingStore.types';

export const PolygonImportExport = ({
  exportPolygonsWithCells,
  exportPolygonsWithTranscripts,
  polygonFeatures,
  isDetecting = false
}: PolygonImportExportProps) => {
  const { t } = useTranslation();
  const [isImporting, setIsImporting] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [IsPlotModalOpen, setIsPlotModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [includeGenes, setIncludeGenes] = useState(true);
  const [selectedFileName, setSelectedFileName] = useState<string>('');

  // Plots state
  const [plotsData, setPlotsData] = useState<ROIData | null>(null);
  const [selectedGenes, setSelectedGenes] = useState<string[]>([]);
  const availableGenes = useRef<{ name: string; type: string; label: string }[]>([]);

  const theme = useTheme();
  const sx = styles(theme);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const importPolygons = usePolygonsFileImport();

  // Check if data is available
  const selectedPoints = useTranscriptLayerStore((store) => store.selectedPoints);
  const selectedCells = useCellSegmentationLayerStore((store) => store.selectedCells);

  const hasTranscriptData = selectedPoints.length > 0;
  const hasSegmentationData = selectedCells.length > 0;

  // Get available genes

  const handleImportClick = () => {
    setIsImportModalOpen(true);
  };

  const handleExportClick = () => {
    setIsExportModalOpen(true);
  };

  // button to pop up modal to select genes for create plot
  const handlePlotClick = () => {
    // Generate plots data when opening the modal
    if (polygonFeatures.length > 0) {
      const { ROIData, selection_list } = generatePolygonCellsData(polygonFeatures);
      setPlotsData(ROIData);
      availableGenes.current = selection_list;
    }
    setIsPlotModalOpen(true);
  };
  // button to create plot in new tab
  const handleCreatePlot = () => {
    if (selectedGenes.length > 0 && plotsData) {
      try {
        // Generate plot data for multiple genes with subplots
        // Create blob URL and open in new tab
        const htmlContent = creatPlots(selectedGenes, plotsData);
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        console.log('Opening new window with URL:', url);

        const newWindow = window.open(url, '_blank');
        console.log('New window object:', newWindow);

        // Clean up blob URL after a delay
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        if (!newWindow) {
          console.error('Failed to open new window - popup blocked');
          enqueueSnackbar(t('plots.popupBlocked'), { variant: 'error' });
        } else {
          console.log('New window opened successfully');
          enqueueSnackbar('Plot opened in new tab', { variant: 'success' });
        }
      } catch (error) {
        console.error('Error creating plot:', error);
        enqueueSnackbar('Error creating plot', { variant: 'error' });
      }
    } else {
      console.log('Missing requirements:', { selectedGenes, plotsData: !!plotsData });
      enqueueSnackbar('Please select at least one gene', { variant: 'warning' });
    }
  };

  const handleJsonExportCells = () => {
    exportPolygonsWithCells(includeGenes);
    setIsExportModalOpen(false);
  };

  const handleJsonExportTranscripts = () => {
    exportPolygonsWithTranscripts();
    setIsExportModalOpen(false);
  };

  const handleCsvExportCells = () => {
    exportPolygonsWithCellsCSV(polygonFeatures, includeGenes);
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

        const loadingSnackbarId = enqueueSnackbar(t('viewer.processingPolygonImport'), {
          variant: 'info',
          persist: true,
          key: 'polygon-import-loading'
        });

        try {
          await importPolygons(file);
          closeSnackbar(loadingSnackbarId);
          enqueueSnackbar(t('viewer.polygonsImportedSuccessfully'), {
            variant: 'success',
            autoHideDuration: 3000
          });
        } catch (error) {
          console.error('Failed to import polygons:', error);
          closeSnackbar(loadingSnackbarId);
          enqueueSnackbar(t('viewer.polygonsImportFailed'), {
            variant: 'error',
            autoHideDuration: 5000
          });
        } finally {
          setIsImporting(false);
          setSelectedFileName('');
        }
      }
    },
    [enqueueSnackbar, closeSnackbar, importPolygons, t]
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
        title={t('Plots')}
        placement="left"
      >
        <IconButton
          sx={sx.controlButton}
          onClick={handlePlotClick}
          color="primary"
          disabled={polygonFeatures.length === 0 || isDetecting}
        >
          <PieChartRoundedIcon />
        </IconButton>
      </MuiTooltip>

      <MuiTooltip
        title={t('viewer.exportPolygons')}
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
        title={t('viewer.importPolygons')}
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
        title={t('viewer.exportPolygons')}
        colorVariant="singular"
        iconVariant="info"
        size="small"
      >
        <Box sx={sx.modalContent}>
          <Box sx={sx.exportGrid}>
            {/* Segmentation Row */}
            <Box>
              <Box sx={sx.exportRow}>
                <Button
                  variant="contained"
                  onClick={handleJsonExportCells}
                  sx={sx.formatButton}
                  fullWidth
                  disabled={!hasSegmentationData}
                >
                  {`JSON - ${t('general.segmentation')}`}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleCsvExportCells}
                  sx={sx.formatButton}
                  disabled={!hasSegmentationData}
                  fullWidth
                >
                  {`CSV - ${t('general.segmentation')}`}
                </Button>
              </Box>
              <FormControlLabel
                label={'Include gene expressions'}
                control={
                  <GxCheckbox
                    onChange={() => setIncludeGenes((state) => !state)}
                    checked={includeGenes}
                    disableTouchRipple
                  />
                }
              />
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
                {`JSON - ${t('general.transcripts')}`}
              </Button>
              <Button
                variant="contained"
                onClick={handleCsvExportTranscripts}
                sx={sx.formatButton}
                disabled={!hasTranscriptData}
                fullWidth
              >
                {`CSV - ${t('general.transcripts')}`}
              </Button>
            </Box>
          </Box>
        </Box>
      </GxModal>

      {/* Import Modal */}
      <GxModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title={t('viewer.importPolygons')}
        colorVariant="singular"
        iconVariant="info"
        size="small"
      >
        <Box sx={sx.modalContent}>
          <Box sx={sx.dropzoneWrapper}>
            <GxDropzoneButton
              labelTitle={t('viewer.importPolygonsTitle')}
              labelText={selectedFileName || t('general.noFileSelected')}
              buttonText={t('viewer.importPolygonsLabel')}
              disabled={isImporting}
              {...dropzoneProps}
            />
          </Box>
        </Box>
      </GxModal>

      {/* Plot gene selection Modal */}
      <GxModal
        isOpen={IsPlotModalOpen}
        onClose={() => {
          setIsPlotModalOpen(false);
          // Reset selections when closing
          setSelectedGenes([]);
          setPlotsData(null);
        }}
        title={t('plots.title')}
        colorVariant="singular"
        iconVariant="info"
        size="default"
      >
        <Box sx={sx.plotsModalContent}>
          {plotsData ? (
            <PlotSelectionTable
              genes={availableGenes.current}
              selectedGenes={selectedGenes}
              onGeneSelect={setSelectedGenes}
              onPlotClick={handleCreatePlot}
              plotDisabled={selectedGenes.length === 0}
            />
          ) : (
            <Box sx={sx.emptyPlotsState}>
              <Typography
                variant="h6"
                color="textSecondary"
              >
                {t('plots.noData')}
              </Typography>
            </Box>
          )}
        </Box>
      </GxModal>
    </Box>
  );
};

const styles = (theme: Theme): Record<string, SxProps> => ({
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
    width: '700px'
  },
  plotsModalContent: {
    width: '600px',
    height: '500px'
  },
  emptyPlotsState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '400px'
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
    height: 'fit-content',
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
