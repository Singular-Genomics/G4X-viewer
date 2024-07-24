import { useDropzone } from "react-dropzone";
import { useCellSegmentationLayerStore } from "../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore";
import * as protobuf from "protobufjs";
import { CellMasksSchema } from "../../../../layers/cell-masks-layer/cell-masks-schema";
import { useState } from "react";

export const useCellMasksFileHandler = () => {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const onDrop = async (files: File[]) => {
    if (files.length !== 1) {
      return;
    }
    setLoading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const cellDataBuffer = new Uint8Array(reader.result as ArrayBuffer);
      const protoRoot = protobuf.Root.fromJSON(CellMasksSchema);

      useCellSegmentationLayerStore.setState({
        cellMasksData: cellDataBuffer,
        cellColormapConfig: (
          protoRoot.lookupType("CellMasks").decode(cellDataBuffer) as any
        ).colormap,
      });
    };
    reader.onerror = () =>
      console.error("Something went wrong during file laod!");
    reader.readAsArrayBuffer(files[0]);
    reader.addEventListener("progress", (event: ProgressEvent<FileReader>) =>
      setProgress(Math.round((event.loaded / event.total) * 100))
    );
    reader.addEventListener("loadend", () => setLoading(false));

    useCellSegmentationLayerStore.setState({
      fileName: files[0].name,
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/octet-stream": [".bin"],
    },
  });

  return {
    getRootProps,
    getInputProps,
    progress,
    loading,
  };
};
