import { useSnackbar } from 'notistack';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import TarWorker from './tarFileWorker.js?worker';
import { parseJsonFromFile } from '../../../../../utils/utils';
import { GeneralDetailsType, useViewerStore } from '../../../../../stores/ViewerStore';
import { ConfigFileData, useBinaryFilesStore } from '../../../../../stores/BinaryFilesStore';
import * as protobuf from 'protobufjs';
import { useTranscriptLayerStore } from '../../../../../stores/TranscriptLayerStore';
import { useCellSegmentationLayerStore } from '../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useBrightfieldImagesStore } from '../../../../../stores/BrightfieldImagesStore';
import { SegmentationFileSchema } from '../../../../../schemas/segmentationFile.schema';
import { validateTranscriptFileSchema } from '../../../../../schemas/transcriptaFile.schema';
import { getMissingFilesContent } from './helpers';
import { useCytometryGraphStore } from '../../../../../stores/CytometryGraphStore/CytometryGraphStore';
import { Trans, useTranslation } from 'react-i18next';
import { CellMasks } from '../../../../../shared/types';

type DataSetConfig = {
  protein_image_src: string;
  protein_image_data_src: string;
  he_images_src: string;
  cell_segmentation_src: string;
  transcript_src: string;
};

type CollectiveFileOutput = {
  proteinImageFile?: File;
  proteinImageData?: File;
  cellSegmentationFile?: File;
  transcriptFile?: File;
  brightfieldImagesFiles?: File[];
};

export const useFileHandler = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const collectiveFileName = useBinaryFilesStore((state) => state.collectiveFileName);
  const setCollectiveFileName = useBinaryFilesStore((state) => state.setCollectiveFileName);

  const verifyDataSetConfig = useCallback(
    (configFile: DataSetConfig): boolean => {
      const missingFileErrors = [];
      if (!configFile.protein_image_src) {
        missingFileErrors.push(t('sourceFiles.collectiveProtein'));
      }
      if (!configFile.protein_image_data_src) {
        missingFileErrors.push(t('sourceFiles.collectiveImageData'));
      }
      if (!configFile.he_images_src) {
        missingFileErrors.push(t('sourceFiles.collectiveH&E'));
      }
      if (!configFile.transcript_src) {
        missingFileErrors.push(t('sourceFiles.collectiveTranscripts'));
      }
      if (!configFile.cell_segmentation_src) {
        missingFileErrors.push(t('sourceFiles.collectiveSegmentation'));
      }

      if (missingFileErrors.length > 0) {
        if (missingFileErrors.length === 1) {
          enqueueSnackbar({
            variant: 'gxSnackbar',
            titleMode: 'error',
            message: t('sourceFiles.collectiveMissingOneError', { error: missingFileErrors[0] }),
            persist: true
          });
        } else {
          enqueueSnackbar({
            variant: 'gxSnackbar',
            titleMode: 'error',
            message: t('sourceFiles.collectiveMissingManyError', { count: missingFileErrors.length }),
            customContent: getMissingFilesContent(missingFileErrors),
            persist: true
          });
        }
        return false;
      }

      return true;
    },
    [enqueueSnackbar, t]
  );

  const parseSegmentationFile = useCallback(
    async (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const cellDataBuffer = new Uint8Array(reader.result as ArrayBuffer);
          const protoRoot = protobuf.Root.fromJSON(SegmentationFileSchema);
          const decodedData: CellMasks = protoRoot.lookupType('CellMasks').decode(cellDataBuffer) as any;

          const colormapConfig = decodedData.colormap;
          const cellMasks = decodedData.cellMasks;

          if (!colormapConfig || !colormapConfig.length) {
            enqueueSnackbar({
              message: t('sourceFiles.segmentationMissingColormap'),
              variant: 'gxSnackbar',
              titleMode: 'warning'
            });
          }

          if (!cellMasks || !cellMasks.length) {
            enqueueSnackbar({
              message: t('sourceFiles.segmentationMissingData'),
              variant: 'error'
            });
          }

          let areUmapAvailable = false;

          if (cellMasks.length) {
            areUmapAvailable = !!cellMasks[0].umapValues;
          }

          useCellSegmentationLayerStore.setState({
            cellMasksData: cellMasks || [],
            cellColormapConfig: colormapConfig.map((entry: any) => ({
              clusterId: entry.clusterId,
              color: entry.color
            })),
            segmentationMetadata: decodedData.metadata,
            umapDataAvailable: areUmapAvailable
          });
          useCytometryGraphStore.getState().resetFilters();
        } catch (error) {
          console.error('Error decoding segmentation file:', error);
          enqueueSnackbar({
            message: (
              <Trans
                i18nKey="sourceFiles.invalidFileFormatError"
                components={{
                  1: (
                    <a
                      href="https://g4x-viewer.legacy.singulargenomics.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  ),
                  2: (
                    <a
                      href="https://docs.singulargenomics.com/G4X-helpers/"
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  )
                }}
              />
            ),
            variant: 'gxSnackbar',
            titleMode: 'error',
            autoHideDuration: 4200
          });
          setLoading(false);
        }
      };
      reader.onerror = () => console.error('Something went wrong during file load!');
      reader.readAsArrayBuffer(file);
      reader.addEventListener('progress', (event: ProgressEvent<FileReader>) =>
        setProgress(Math.round((event.loaded / event.total) * 100))
      );
      reader.addEventListener('loadend', () => setLoading(false));

      useCellSegmentationLayerStore.setState({
        fileName: file.name.split('/').pop() || 'unknown'
      });
    },
    [enqueueSnackbar, t]
  );

  const processTranscriptTarFile = useCallback(
    async (tarFile: File) => {
      setLoading(true);
      const worker = new TarWorker();

      worker.onmessage = async (e) => {
        if (e.data.progress) {
          setProgress(e.data.progress);
        }

        if (e.data.files && e.data.completed) {
          const extractedFiles = e.data.files;

          const isValidSchema = await validateTranscriptFileSchema(extractedFiles);

          if (!isValidSchema) {
            enqueueSnackbar({
              message: (
                <Trans
                  i18nKey="sourceFiles.invalidFileFormatError"
                  components={{
                    1: (
                      <a
                        href="https://g4x-viewer.legacy.singulargenomics.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    ),
                    2: (
                      <a
                        href="https://docs.singulargenomics.com/G4X-helpers/"
                        target="_blank"
                        rel="noopener noreferrer"
                      />
                    )
                  }}
                />
              ),
              variant: 'gxSnackbar',
              titleMode: 'error',
              autoHideDuration: 4200
            });
            setLoading(false);
            worker.terminate();
            return;
          }

          const configFile = extractedFiles.find((f: File) => f.name.endsWith('config.json'));

          if (configFile) {
            const parsedConfig = (await parseJsonFromFile(configFile)) as ConfigFileData;
            const { color_map, ...layerConfig } = parsedConfig;
            if (!color_map) {
              enqueueSnackbar({
                message: t('sourceFiles.transcriptsMissingColormap'),
                variant: 'gxSnackbar',
                titleMode: 'warning'
              });
            }

            const { setLayerConfig, setColormapConfig, setFiles, setFileName } = useBinaryFilesStore.getState();
            setLayerConfig(layerConfig);
            setColormapConfig(color_map);
            setFiles(extractedFiles);
            useTranscriptLayerStore.setState({
              maxVisibleLayers: layerConfig.layers
            });

            // Extract filename from the tar file
            const tarFileName = tarFile.name.split('/').pop() || 'unknown';
            setFileName(tarFileName);
          } else {
            enqueueSnackbar({
              message: t('sourceFiles.collectiveMissingTranscriptsConfig'),
              variant: 'gxSnackbar',
              titleMode: 'error'
            });
          }

          setLoading(false);
          worker.terminate();
        }
      };

      worker.onerror = (error: ErrorEvent) => {
        console.error(error);
        enqueueSnackbar({
          message: t('sourceFiles.collectiveErrorTranscriptUnpacking'),
          variant: 'gxSnackbar',
          titleMode: 'error'
        });
        setLoading(false);
        worker.terminate();
      };

      worker.postMessage(tarFile);
    },
    [enqueueSnackbar, t]
  );

  const parseCollectiveFileData = useCallback(
    async (inputFiles: File[], datasetConfig: DataSetConfig) => {
      const outputFiles: CollectiveFileOutput = {
        brightfieldImagesFiles: []
      };

      inputFiles.forEach((file) => {
        if (file.name.endsWith(datasetConfig.transcript_src)) {
          outputFiles.transcriptFile = file;
        } else if (file.name.includes(datasetConfig.he_images_src)) {
          outputFiles.brightfieldImagesFiles?.push(file);
        } else if (file.name.endsWith(datasetConfig.cell_segmentation_src)) {
          outputFiles.cellSegmentationFile = file;
        } else if (file.name.endsWith(datasetConfig.protein_image_src)) {
          outputFiles.proteinImageFile = file;
        } else if (file.name.endsWith(datasetConfig.protein_image_data_src)) {
          outputFiles.proteinImageData = file;
        } else if (!file.name.endsWith('.json')) {
          console.warn(`Unknown file: ${file.name}`);
        }
      });

      if (!outputFiles.proteinImageFile) {
        enqueueSnackbar({
          message: t('sourceFiles.collectiveMissingProtein'),
          variant: 'gxSnackbar',
          titleMode: 'error'
        });
        return false;
      }

      useViewerStore.setState({
        source: {
          urlOrFile: outputFiles.proteinImageFile,
          description: outputFiles.proteinImageFile.name.split('/').pop() || 'unknown'
        }
      });

      const parsingWarnings = [];

      if (!outputFiles.proteinImageData) {
        parsingWarnings.push(t('sourceFiles.collectiveMissingImageData'));
      } else {
        try {
          const generalDetails: GeneralDetailsType = {
            fileName: outputFiles.proteinImageData.name.split('/').pop() || 'unknown',
            data: JSON.parse(await outputFiles.proteinImageData.text())
          };

          useViewerStore.getState().setGeneralDetails(generalDetails);
        } catch (error) {
          enqueueSnackbar({
            message: t('sourceFiles.metadataParsingError', { message: (error as Error).message }),
            variant: 'gxSnackbar',
            titleMode: 'error'
          });
        }
      }

      if (!outputFiles.transcriptFile) {
        parsingWarnings.push(t('sourceFiles.collectiveMissingTranscripts'));
      } else {
        // Process the transcript tar file
        await processTranscriptTarFile(outputFiles.transcriptFile);
      }

      if (!outputFiles.cellSegmentationFile) {
        parsingWarnings.push(t('sourceFiles.collectiveMissingSegmentation'));
      } else {
        parseSegmentationFile(outputFiles.cellSegmentationFile);
      }

      const { setAvailableImages } = useBrightfieldImagesStore.getState();
      if (!outputFiles.brightfieldImagesFiles?.length) {
        parsingWarnings.push(t('sourceFiles.collectiveMissingH&E'));
      } else {
        setAvailableImages(outputFiles.brightfieldImagesFiles);
      }

      if (parsingWarnings.length > 0) {
        enqueueSnackbar(t('sourceFiles.collectiveSkippedFiles', { count: parsingWarnings.length }), {
          persist: true,
          customContent: getMissingFilesContent(parsingWarnings),
          variant: 'gxSnackbar',
          titleMode: 'warning'
        });
      }
    },
    [enqueueSnackbar, processTranscriptTarFile, parseSegmentationFile, t]
  );

  const handleWorkerProgress = async (e: any) => {
    if (e.data.progress) {
      setProgress(e.data.progress);
    }

    if (e.data.files && e.data.completed) {
      const datasetConfig = e.data.files.find((f: File) => f.name.endsWith('dataset.config.json'));

      if (!datasetConfig) {
        enqueueSnackbar({
          message: t('sourceFiles.collectiveMissingDatasetConfig'),
          variant: 'gxSnackbar',
          titleMode: 'error'
        });
        setLoading(false);
        setCollectiveFileName('');
        return;
      }

      const parsedDatasetConfig = (await parseJsonFromFile(datasetConfig)) as DataSetConfig;

      if (!verifyDataSetConfig(parsedDatasetConfig)) {
        console.error('Verification failed');
        setLoading(false);
        setCollectiveFileName('');
        return;
      }

      console.info('Verification successful');
      parseCollectiveFileData(e.data.files, parsedDatasetConfig);
      useTranscriptLayerStore.setState({ isTranscriptLayerOn: false });
      useCellSegmentationLayerStore.setState({ isCellLayerOn: false });
      setLoading(false);
      return;
    }
  };

  const processFile = async (file: File) => {
    useViewerStore.getState().reset();
    useBinaryFilesStore.getState().reset();
    useTranscriptLayerStore.getState().reset();
    useCellSegmentationLayerStore.getState().reset();
    useBrightfieldImagesStore.getState().reset();
    setLoading(true);
    const worker = new TarWorker();

    worker.onmessage = (e) => {
      handleWorkerProgress(e);
      if (e.data.completed) worker.terminate();
    };

    worker.onerror = (error: ErrorEvent) => {
      console.error(error);
      enqueueSnackbar({
        message: t('sourceFiles.transcriptsUnpackError', { file: file.type }),
        variant: 'gxSnackbar',
        titleMode: 'error'
      });
      setLoading(false);
      setCollectiveFileName('');
      worker.terminate();
    };

    worker.postMessage(file);
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;

    setProgress(0);
    const file = acceptedFiles[0];
    if (file.type !== 'application/x-tar') {
      enqueueSnackbar({
        message: t('sourceFiles.collectiveUnsupportedFile'),
        variant: 'gxSnackbar',
        titleMode: 'warning'
      });
      return;
    }

    processFile(file);
    setCollectiveFileName(file.name);
  };

  const dropzoneProps = useDropzone({
    onDrop,
    accept: {
      'application/x-tar': ['.g4x.tar']
    }
  });

  return {
    dropzoneProps,
    loading,
    progress,
    collectiveFileName
  };
};
