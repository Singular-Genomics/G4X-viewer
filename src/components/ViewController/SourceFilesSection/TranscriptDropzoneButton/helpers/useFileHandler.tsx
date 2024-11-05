import { useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  ConfigFileData,
  useBinaryFilesStore,
} from "../../../../../stores/BinaryFilesStore";
import { useSnackbar } from "notistack";
import ZipWorker from "./zipWorker.js?worker";
import TarWorker from "./tarWorker.js?worker";
import { parseJsonFromFile } from "../../../../../utils/utils";
import { useTranscriptLayerStore } from "../../../../../stores/TranscriptLayerStore";

type WorkerType = typeof ZipWorker | typeof TarWorker;

export const useFileHandler = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { enqueueSnackbar } = useSnackbar();
  const { setFiles, setLayerConfig, setFileName, setColormapConfig } =
    useBinaryFilesStore();

  const handleWorkerProgress = async (e: any) => {
    if (e.data.progress) {
      setProgress(e.data.progress);
    }
    if (e.data.files && e.data.completed) {
      const configFile = e.data.files.find((f: File) =>
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

      setFiles(e.data.files);
      enqueueSnackbar({ message: "Successfully unpacked", variant: "success" });
      setLoading(false);
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
        message: `Error unpacking ${file.type}`,
        variant: "error",
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
      case "application/zip":
        processFile(file, ZipWorker);
        break;
      case "application/x-tar":
        processFile(file, TarWorker);
        break;
      default:
        enqueueSnackbar({
          message: "File type not supported",
          variant: "warning",
        });
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "application/zip": [".zip"],
      "application/x-tar": [".tar"],
    },
  });

  return {
    getRootProps,
    getInputProps,
    loading,
    progress,
  };
};
