import {
  Box,
  IconButton,
  Theme,
  alpha,
  useTheme,
  Button,
  FormControlLabel,
  SxProps,
  RadioGroup,
  Radio,
  Typography,
  FormControl,
  FormLabel
} from '@mui/material';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import MuiTooltip from '@mui/material/Tooltip';
import { useSnackbar } from 'notistack';
import { GxModal } from '../../shared/components/GxModal';
import { GxDropzoneButton } from '../../shared/components/GxDropzoneButton';
import { PolygonImportExportProps, ExportFormat, EXPORT_FORMATS } from './PolygonImportExport.types';
import {
  exportPolygonsWithCellsCSV,
  exportPolygonsWithTranscriptsCSV,
  exportROIMetadataCSV,
  exportPolygonsWithCellsCSVAsTar,
  exportPolygonsWithTranscriptsCSVAsTar,
  exportPolygonsWithCellsCSVAsZip,
  exportPolygonsWithTranscriptsCSVAsZip
} from './PolygonImportExport.helpers';
import { useCellSegmentationLayerStore } from '../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { usePolygonsFileImport } from './PolygonImportExport.hooks';
import { useTranscriptLayerStore } from '../../stores/TranscriptLayerStore';
import { useTranslation } from 'react-i18next';
import { GxCheckbox } from '../../shared/components/GxCheckbox';

export const PolygonImportExport = ({
  exportPolygonsWithCells,
  exportPolygonsWithTranscripts,
  polygonFeatures,
  isDetecting = false
}: PolygonImportExportProps) => {
  const { t } = useTranslation();
  const [isImporting, setIsImporting] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [includeGenes, setIncludeGenes] = useState(true);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [exportFormat, setExportFormat] = useState<ExportFormat>(EXPORT_FORMATS.INDIVIDUAL);
  const theme = useTheme();
  const sx = styles(theme);
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const importPolygons = usePolygonsFileImport();

  // Check if data is available
  const selectedPoints = useTranscriptLayerStore((store) => store.selectedPoints);
  const selectedCells = useCellSegmentationLayerStore((store) => store.selectedCells);

  const hasTranscriptData = selectedPoints.length > 0;
  const hasSegmentationData = selectedCells.length > 0;

  const handleImportClick = () => {
    setIsImportModalOpen(true);
  };

  const handleExportClick = () => {
    setIsExportModalOpen(true);
  };

  const handleJsonExportCells = () => {
    exportPolygonsWithCells(includeGenes);
    setIsExportModalOpen(false);
  };

  const handleJsonExportTranscripts = () => {
    exportPolygonsWithTranscripts();
    setIsExportModalOpen(false);
  };

  const handleCsvExportCells = async () => {
    if (exportFormat === EXPORT_FORMATS.INDIVIDUAL) {
      exportPolygonsWithCellsCSV(polygonFeatures, includeGenes);
      exportROIMetadataCSV(polygonFeatures);
    } else if (exportFormat === EXPORT_FORMATS.TAR) {
      exportPolygonsWithCellsCSVAsTar(polygonFeatures, includeGenes);
    } else if (exportFormat === EXPORT_FORMATS.ZIP) {
      await exportPolygonsWithCellsCSVAsZip(polygonFeatures, includeGenes);
    }
    setIsExportModalOpen(false);
  };

  const handleCsvExportTranscripts = async () => {
    if (exportFormat === EXPORT_FORMATS.INDIVIDUAL) {
      exportPolygonsWithTranscriptsCSV(polygonFeatures);
      exportROIMetadataCSV(polygonFeatures);
    } else if (exportFormat === EXPORT_FORMATS.TAR) {
      exportPolygonsWithTranscriptsCSVAsTar(polygonFeatures);
    } else if (exportFormat === EXPORT_FORMATS.ZIP) {
      await exportPolygonsWithTranscriptsCSVAsZip(polygonFeatures);
    }
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
          {/* Export Format Selection */}
          <FormControl
            component="fieldset"
            sx={sx.formatControl}
          >
            <FormLabel component="legend">
              <Typography variant="subtitle2">{t('general.exportFormat')}</Typography>
            </FormLabel>
            <RadioGroup
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
              sx={sx.radioGroup}
            >
              <FormControlLabel
                value={EXPORT_FORMATS.INDIVIDUAL}
                control={<Radio size="small" />}
                label={t('general.exportFormatIndividual')}
                sx={sx.radioOption}
              />
              <FormControlLabel
                value={EXPORT_FORMATS.TAR}
                control={<Radio size="small" />}
                label={t('general.exportFormatTar')}
                sx={sx.radioOption}
              />
              <FormControlLabel
                value={EXPORT_FORMATS.ZIP}
                control={<Radio size="small" />}
                label={t('general.exportFormatZip')}
                sx={sx.radioOption}
              />
            </RadioGroup>
          </FormControl>

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
                label={t('general.includeGeneExpressions')}
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
  },
  formatControl: {
    marginBottom: '24px',
    '& .MuiFormLabel-root': {
      color: theme.palette.gx.primary.black,
      marginBottom: '8px'
    }
  },
  radioGroup: {
    flexDirection: 'row',
    gap: '16px'
  },
  radioOption: {
    '& .MuiFormControlLabel-label': {
      fontSize: '14px',
      color: theme.palette.gx.primary.black
    },
    '& .MuiRadio-root': {
      color: theme.palette.gx.mediumGrey[900],
      '&.Mui-checked': {
        color: theme.palette.gx.accent.greenBlue
      }
    }
  }
});
