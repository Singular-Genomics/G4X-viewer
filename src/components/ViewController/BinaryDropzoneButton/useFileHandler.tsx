import { useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  LayerConfig,
  useBinaryFilesStore,
} from "../../../stores/BinaryFilesStore";
import { useSnackbar } from "notistack";
import ZipWorker from "./zipWorker.js?worker";
import TarWorker from "./tarWorker.js?worker";
import { paseJsonFromFile } from "../../../utils/utils";

type WorkerType = typeof ZipWorker | typeof TarWorker;

export const useFileHandler = () => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { enqueueSnackbar } = useSnackbar();
  const { setFiles, setConfig } = useBinaryFilesStore();

  const handleWorkerProgress = async (e: any) => {
    if (e.data.progress) {
      setProgress(e.data.progress);
    }
    if (e.data.files && e.data.completed) {
      const configFile = e.data.files.find((f: File) =>
        f.name.endsWith("config.json")
      );

      if (configFile) {
        const configData = (await paseJsonFromFile(configFile)) as LayerConfig;
        setConfig(configData);
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
