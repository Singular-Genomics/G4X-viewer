import { useSnackbar } from "notistack";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import TarWorker from "./tarFileWorker.js?worker";
import { parseJsonFromFile } from "../../../../../utils/utils";
import { useViewerStore } from "../../../../../stores/ViewerStore";
import {
  ConfigFileData,
  useBinaryFilesStore,
} from "../../../../../stores/BinaryFilesStore";
import * as protobuf from "protobufjs";
import { useTranscriptLayerStore } from "../../../../../stores/TranscriptLayerStore";
import { useCellSegmentationLayerStore } from "../../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore";
import { useHEImagesStore } from "../../../../../stores/HEImagesStore";
import { CellMasksSchema } from "../../../../../layers/cell-masks-layer/cell-masks-schema";

type DataSetConfig = {
  protein_image_src: string;
  he_images_src: string;
  cell_segmentation_src: string;
  transcript_src: string;
};

type CollectiveFileOutput = {
  proteinImageFile?: File;
  cellSegmentationFile?: File;
  transcriptFiles?: File[];
  heImagesFiles?: File[];
};

export const useFileHandler = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { enqueueSnackbar } = useSnackbar();

  const verifyDataSetConfig = useCallback(
    (configFile: DataSetConfig): boolean => {
      let missingFileError = "";
      if (!configFile.protein_image_src) {
        missingFileError = "protein image file";
      } else if (!configFile.he_images_src) {
        missingFileError = "H&E image file";
      } else if (!configFile.transcript_src) {
        missingFileError = "transcripts directory";
      } else if (!configFile.cell_segmentation_src) {
        missingFileError = "cell segmentation file";
      }

      if (missingFileError) {
        enqueueSnackbar({
          message: `Data set is missing ${missingFileError} source name in the config file`,
        });
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
        const colormapConfig = (
          protoRoot.lookupType("CellMasks").decode(cellDataBuffer) as any
        ).colormap;

        if (!colormapConfig || !colormapConfig.length) {
          enqueueSnackbar({
            message:
              "Missing colormap config, transcript metadata filtering will be unavailable",
            variant: "warning",
          });
        }

        useCellSegmentationLayerStore.setState({
          cellMasksData: cellDataBuffer,
          cellColormapConfig: colormapConfig,
        });
      };
      reader.onerror = () =>
        console.error("Something went wrong during file laod!");
      reader.readAsArrayBuffer(file);
      reader.addEventListener("progress", (event: ProgressEvent<FileReader>) =>
        setProgress(Math.round((event.loaded / event.total) * 100))
      );
      reader.addEventListener("loadend", () => setLoading(false));

      useCellSegmentationLayerStore.setState({
        fileName: file.name.split("/").pop() || "unknown",
      });
    },
    [enqueueSnackbar]
  );

  const parseTranscriptFiles = useCallback(
    async (files: File[]) => {
      const { setFiles, setFileName, setLayerConfig, setColormapConfig } =
        useBinaryFilesStore.getState();
      const configFile = files.find((f: File) =>
        f.name.endsWith("config.json")
      );

      if (configFile) {
        const parsedConfig = (await parseJsonFromFile(
          configFile
        )) as ConfigFileData;
        const { color_map, ...layerConfig } = parsedConfig;
        if (!color_map) {
          enqueueSnackbar({
            message:
              "Missing colormap config, cell segmentation filtering will be unavailable",
            variant: "warning",
          });
        }

        setLayerConfig(layerConfig);
        setColormapConfig(color_map);
        useTranscriptLayerStore.setState({
          maxVisibleLayers: layerConfig.layers,
        });
      }

      let fileName = "unknown";
      if (files.length) {
        const nameSegemnts = files[0].name.split("/");
        fileName =
          nameSegemnts.length < 2 ? `${nameSegemnts[1]}.tar` : "unknown";
      }

      setFiles(files);
      setFileName(fileName);
    },
    [enqueueSnackbar]
  );

  const parseCollectiveFileData = useCallback(
    async (inputFiles: File[], datasetConfig: DataSetConfig) => {
      const outputFiles: CollectiveFileOutput = {
        transcriptFiles: [],
        heImagesFiles: [],
      };

      inputFiles.forEach((file) => {
        if (file.name.includes(datasetConfig.transcript_src)) {
          outputFiles.transcriptFiles?.push(file);
        } else if (file.name.includes(datasetConfig.he_images_src)) {
          outputFiles.heImagesFiles?.push(file);
        } else if (file.name.endsWith(datasetConfig.cell_segmentation_src)) {
          outputFiles.cellSegmentationFile = file;
        } else if (file.name.endsWith(datasetConfig.protein_image_src)) {
          outputFiles.proteinImageFile = file;
        } else if (!file.name.endsWith(".json")) {
          console.warn(`Unknown file: ${file.name}`);
        }
      });

      if (!outputFiles.proteinImageFile) {
        enqueueSnackbar({
          message: "Missing protein image file",
          variant: "error",
        });
        return false;
      }

      useViewerStore.setState({
        source: {
          urlOrFile: outputFiles.proteinImageFile,
          description:
            outputFiles.proteinImageFile.name.split("/").pop() || "unknwon",
        },
      });

      if (!outputFiles.transcriptFiles?.length) {
        enqueueSnackbar({
          message: "Missing transcript files",
          variant: "warning",
        });
      } else {
        await parseTranscriptFiles(outputFiles.transcriptFiles);
      }

      if (!outputFiles.cellSegmentationFile) {
        enqueueSnackbar({
          message: "Missing cell segmentation file",
          variant: "warning",
        });
      } else {
        parseSegmentationFile(outputFiles.cellSegmentationFile);
      }
    },
    [enqueueSnackbar, parseTranscriptFiles, parseSegmentationFile]
  );

  const handleWorkerProgress = async (e: any) => {
    if (e.data.progress) {
      setProgress(e.data.progress);
    }

    if (e.data.files && e.data.completed) {
      const datasetConfig = e.data.files.find((f: File) =>
        f.name.endsWith("dataset.config.json")
      );

      if (!datasetConfig) {
        enqueueSnackbar({
          message: "Missing data set config file.",
          variant: "error",
        });
      }

      const parsedDatasetConfig = (await parseJsonFromFile(
        datasetConfig
      )) as DataSetConfig;

      if (!verifyDataSetConfig(parsedDatasetConfig)) {
        console.error("Verification failed");
        setLoading(false);
        return;
      }

      console.info("Verification successfull");
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
    useHEImagesStore.getState().reset();
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
        variant: "error",
      });
      setLoading(false);
      worker.terminate();
    };

    worker.postMessage(file);
  };

  const onDrop = async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;

    setProgress(0);
    const file = acceptedFiles[0];
    if (file.type !== "application/x-tar") {
      enqueueSnackbar({
        message: "File type not supported",
        variant: "warning",
      });
      return;
    }

    processFile(file);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/x-tar": [".g4x.tar"],
    },
  });

  return {
    getRootProps,
    getInputProps,
    loading,
    progress,
  };
};
