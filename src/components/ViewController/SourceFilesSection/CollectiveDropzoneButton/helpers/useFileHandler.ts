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
import { CellMasksSchema } from '../../../../../layers/cell-masks-layer/cell-masks-schema';
import { getMissingFilesContent } from './helpers';
import { useCytometryGraphStore } from '../../../../../stores/CytometryGraphStore/CytometryGraphStore';

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

  const collectiveFileName = useBinaryFilesStore((state) => state.collectiveFileName);
  const setCollectiveFileName = useBinaryFilesStore((state) => state.setCollectiveFileName);

  const verifyDataSetConfig = useCallback(
    (configFile: DataSetConfig): boolean => {
      const missingFileErrors = [];
      if (!configFile.protein_image_src) {
        missingFileErrors.push('Protein image file');
      }
      if (!configFile.protein_image_data_src) {
        missingFileErrors.push('Protein image data config');
      }
      if (!configFile.he_images_src) {
        missingFileErrors.push('H&E images directory');
      }
      if (!configFile.transcript_src) {
        missingFileErrors.push('Transcripts TAR file');
      }
      if (!configFile.cell_segmentation_src) {
        missingFileErrors.push('Cell segmentation BIN file');
      }

      if (missingFileErrors.length > 0) {
        if (missingFileErrors.length === 1) {
          enqueueSnackbar({
            variant: 'gxSnackbar',
            titleMode: 'error',
            message: `Data set config is missing ${missingFileErrors[0]} source definition`,
            persist: true
          });
        } else {
          enqueueSnackbar({
            variant: 'gxSnackbar',
            titleMode: 'error',
            message: `Data set config is missing ${missingFileErrors.length} source definitions.`,
            customContent: getMissingFilesContent(missingFileErrors),
            persist: true
          });
        }
        return false;
      }

      return true;
    },
    [enqueueSnackbar]
  );

  const parseSegmentationFile = useCallback(
    async (file: File) => {
      const reader = new FileReader();
      reader.onload = () => {
        const cellDataBuffer = new Uint8Array(reader.result as ArrayBuffer);
        const protoRoot = protobuf.Root.fromJSON(CellMasksSchema);
        const decodedData = protoRoot.lookupType('CellMasks').decode(cellDataBuffer) as any;

        const colormapConfig = decodedData.colormap;
        const cellMasks = decodedData.cellMasks;

        if (!colormapConfig || !colormapConfig.length) {
          enqueueSnackbar({
            message: 'Missing colormap config, transcript metadata filtering will be unavailable',
            variant: 'gxSnackbar',
            titleMode: 'warning'
          });
        }

        if (!cellMasks || !cellMasks.length) {
          enqueueSnackbar({
            message: 'Given file is missing cell segmentation masks data',
            variant: 'error'
          });
        }

        let listOfProteinNames: string[] = [];
        let areUmapAvailable = false;

        if (cellMasks.length) {
          listOfProteinNames = Object.keys(cellMasks[0].proteins);
          areUmapAvailable = !!cellMasks[0].umapValues;
        }

        useCellSegmentationLayerStore.setState({
          cellMasksData: cellMasks || [],
          cellColormapConfig: colormapConfig.map((entry: any) => ({
            clusterId: entry.clusterId,
            color: entry.color
          })),
          cytometryProteinsNames: listOfProteinNames,
          umapDataAvailable: areUmapAvailable
        });
        useCytometryGraphStore.getState().resetFilters();
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
    [enqueueSnackbar]
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
          const configFile = extractedFiles.find((f: File) => f.name.endsWith('config.json'));

          if (configFile) {
            const parsedConfig = (await parseJsonFromFile(configFile)) as ConfigFileData;
            const { color_map, ...layerConfig } = parsedConfig;
            if (!color_map) {
              enqueueSnackbar({
                message: 'Missing colormap config, cell segmentation filtering will be unavailable',
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
              message: 'Missing transcript config file in TAR archive',
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
          message: `Error unpacking transcript TAR file`,
          variant: 'gxSnackbar',
          titleMode: 'error'
        });
        setLoading(false);
        worker.terminate();
      };

      worker.postMessage(tarFile);
    },
    [enqueueSnackbar]
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
          message: 'Missing protein image file',
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
        parsingWarnings.push('Missing protein image data JSON');
      } else {
        try {
          const generalDetails: GeneralDetailsType = {
            fileName: outputFiles.proteinImageData.name.split('/').pop() || 'unknown',
            data: JSON.parse(await outputFiles.proteinImageData.text())
          };

          useViewerStore.getState().setGeneralDetails(generalDetails);
        } catch (error) {
          enqueueSnackbar({
            message: 'Error parsing protein image data JSON file: ' + (error as Error).message,
            variant: 'gxSnackbar',
            titleMode: 'error'
          });
        }
      }

      if (!outputFiles.transcriptFile) {
        parsingWarnings.push('Missing transcript file');
      } else {
        // Process the transcript tar file
        await processTranscriptTarFile(outputFiles.transcriptFile);
      }

      if (!outputFiles.cellSegmentationFile) {
        parsingWarnings.push('Missing cell segmentation file');
      } else {
        parseSegmentationFile(outputFiles.cellSegmentationFile);
      }

      const { setAvailableImages } = useBrightfieldImagesStore.getState();
      if (!outputFiles.brightfieldImagesFiles?.length) {
        parsingWarnings.push('Missing H&E images source');
      } else {
        setAvailableImages(outputFiles.brightfieldImagesFiles);
      }

      if (parsingWarnings.length > 0) {
        enqueueSnackbar(`${parsingWarnings.length} missing files were skipped during parsing`, {
          persist: true,
          customContent: getMissingFilesContent(parsingWarnings),
          variant: 'gxSnackbar',
          titleMode: 'warning'
        });
      }
    },
    [enqueueSnackbar, processTranscriptTarFile, parseSegmentationFile]
  );

  const handleWorkerProgress = async (e: any) => {
    if (e.data.progress) {
      setProgress(e.data.progress);
    }

    if (e.data.files && e.data.completed) {
      const datasetConfig = e.data.files.find((f: File) => f.name.endsWith('dataset.config.json'));

      if (!datasetConfig) {
        enqueueSnackbar({
          message: 'Missing data set config file.',
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
        message: `Error unpacking ${file.type}`,
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
        message: 'File type not supported',
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
