import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ConfigFileData, useBinaryFilesStore } from '../../../../../stores/BinaryFilesStore';
import { useSnackbar } from 'notistack';
import ZipWorker from './zipWorker.js?worker';
import TarWorker from './tarWorker.js?worker';
import { parseJsonFromFile } from '../../../../../utils/utils';
import { useTranscriptLayerStore } from '../../../../../stores/TranscriptLayerStore';
import { usePolygonDetectionWorker } from '../../../../PictureInPictureViewerAdapter/worker/usePolygonDetectionWorker';
import { usePolygonDrawingStore } from '../../../../../stores/PolygonDrawingStore';
import { useTranslation } from 'react-i18next';
import { validateTranscriptFileSchema } from '../../../../../schemas/transcriptaFile.schema';

type WorkerType = typeof ZipWorker | typeof TarWorker;

export const useFileHandler = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();
  const { setFiles, setLayerConfig, setFileName, setColormapConfig } = useBinaryFilesStore();
  const { addSelectedPoints, setSelectedPoints } = useTranscriptLayerStore();
  const { detectPointsInPolygon } = usePolygonDetectionWorker();
  const { setDetecting } = usePolygonDrawingStore();

  const handleWorkerProgress = async (e: any) => {
    if (e.data.progress) {
      setProgress(e.data.progress);
    }
    if (e.data.files && e.data.completed) {
      try {
        const isValidSchema = await validateTranscriptFileSchema(e.data.files);

        if (!isValidSchema) {
          enqueueSnackbar({
            message: t('sourceFiles.invalidFileFormatError'),
            variant: 'gxSnackbar',
            titleMode: 'error'
          });
          setLoading(false);
          return;
        }

        const configFile = e.data.files.find((f: File) => f.name.endsWith('config.json'));
        let parsedConfigFile;
        if (configFile) {
          parsedConfigFile = (await parseJsonFromFile(configFile)) as ConfigFileData;
          const { color_map, ...layerConfig } = parsedConfigFile;
          if (!color_map) {
            enqueueSnackbar({
              message: t('sourceFiles.transcriptsMissingColormap'),
              variant: 'warning'
            });
          }

          setLayerConfig(layerConfig);
          setColormapConfig(color_map);
          useTranscriptLayerStore.setState({
            maxVisibleLayers: layerConfig.layers
          });
        }

        const polygonFeatures = usePolygonDrawingStore.getState().polygonFeatures;

        if (polygonFeatures.length > 0 && parsedConfigFile) {
          setDetecting(true);
          enqueueSnackbar({
            variant: 'gxSnackbar',
            titleMode: 'info',
            message: t('interactiveLayer.detectingTranscripts')
          });

          setSelectedPoints([]);
          for (const polygon of polygonFeatures) {
            const result = await detectPointsInPolygon(polygon, e.data.files, parsedConfigFile);

            // Skip this polygon if point limit was exceeded
            if (result.limitExceeded) {
              enqueueSnackbar({
                variant: 'gxSnackbar',
                titleMode: 'warning',
                message: t('interactiveLayer.pointLimitExceededSimple')
              });
              continue;
            }

            polygon.properties = {
              ...polygon.properties,
              pointCount: result.pointCount,
              geneDistribution: result.geneDistribution
            };

            addSelectedPoints({ data: result.pointsInPolygon, roiId: polygon.properties.polygonId });
          }

          setDetecting(false);
        }

        setFiles(e.data.files);
        enqueueSnackbar({ message: t('sourceFiles.transcriptsUnpackSuccess'), variant: 'success' });
        setLoading(false);
      } catch (error) {
        console.error('Error processing transcript files:', error);
        const errorObj = error as Error;
        if (errorObj?.name && errorObj.name === 'NotReadableError') {
          enqueueSnackbar({
            message: t('sourceFiles.notReadableErrorWarning') + ' ' + t('sourceFiles.notReadableErrorWorkaround'),
            variant: 'gxSnackbar',
            titleMode: 'error',
            persist: true
          });
          enqueueSnackbar({
            message: t('sourceFiles.notReadableErrorWorkaround'),
            variant: 'gxSnackbar',
            titleMode: 'error',
            persist: true
          });
        } else {
          enqueueSnackbar({
            message: t('sourceFiles.invalidFileFormatError'),
            variant: 'gxSnackbar',
            titleMode: 'error'
          });
        }
        setLoading(false);
      }
    }
  };

  const processFile = async (file: File, WorkerType: WorkerType) => {
    setLoading(true);
    const worker = new WorkerType();
    worker.onmessage = (e) => {
      handleWorkerProgress(e);
      if (e.data.completed) worker.terminate();
    };
    worker.onerror = function (error: ErrorEvent) {
      console.error(`Error in ${WorkerType.name}:`, error);
      enqueueSnackbar({
        message: t('sourceFiles.transcriptsUnpackError', { file: file.type }),
        variant: 'error'
      });
      setLoading(false);
      worker.terminate();
    };
    setFileName(file.name);
    worker.postMessage(file);
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;

    setProgress(0);
    const file = acceptedFiles[0];

    switch (file.type) {
      case 'application/zip':
        processFile(file, ZipWorker);
        break;
      case 'application/x-tar':
        processFile(file, TarWorker);
        break;
      default:
        enqueueSnackbar({
          message: t('sourceFiles.transcriptsUnsupportedError'),
          variant: 'warning'
        });
    }
  };

  const dropzoneProps = useDropzone({
    onDrop,
    accept: {
      'application/zip': ['.zip'],
      'application/x-tar': ['.tar']
    }
  });

  return {
    dropzoneProps,
    loading,
    progress
  };
};
