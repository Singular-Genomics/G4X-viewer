import { useDropzone } from "react-dropzone"
import { useCellMasksLayerStore } from "../../../../stores/CellMasksLayerStore/CellMasksLayerStore"

export const useCellMasksFileHandler = () => {
  const onDrop = (files: File[]) => {
    if (files.length !== 1){
      return
    }

    const reader = new FileReader();
    reader.onload = () => {
        const cellDataBuffer = reader.result as ArrayBuffer;

        useCellMasksLayerStore.setState({
          cellMasksData: new Uint8Array(cellDataBuffer)
        })
    }
    reader.onerror = () => console.error("Reader is fucked!");
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