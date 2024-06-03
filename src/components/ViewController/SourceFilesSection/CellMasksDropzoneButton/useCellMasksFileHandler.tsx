import { useDropzone } from "react-dropzone"
import { useCellMasksLayerStore } from "../../../../stores/CellMasksLayerStore/CellMasksLayerStore"
import * as protobuf from "protobufjs";
import { CellMasksSchema } from "../../../../layers/cell-masks-layer/cell-masks-schema";

export const useCellMasksFileHandler = () => {
  const onDrop = (files: File[]) => {
    if (files.length !== 1){
      return
    }

    const reader = new FileReader();
    reader.onload = () => {
        const cellDataBuffer = new Uint8Array(reader.result as ArrayBuffer);
        const protoRoot = protobuf.Root.fromJSON(CellMasksSchema);


        useCellMasksLayerStore.setState({
          cellMasksData: cellDataBuffer,
          cellColormapConfig: (protoRoot.lookupType("CellMasks").decode(cellDataBuffer) as any).colormap,
        })
    }
    reader.onerror = () => console.error("Something went wrong during file laod!");
    reader.readAsArrayBuffer(files[0]);

    useCellMasksLayerStore.setState({ 
      fileName: files[0].name,
    })
  }

  const { getRootProps, getInputProps} = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/octet-stream": [".bin"]
    },
  })

  return {
    getRootProps,
    getInputProps,
  }
}