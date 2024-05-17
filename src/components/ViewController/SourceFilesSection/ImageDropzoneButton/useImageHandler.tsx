import { useDropzone } from "react-dropzone";
import { useViewerStore } from "../../../../stores/ViewerStore";

export const useImageHandler = () => {
  
  const onDrop = (files: File[]) => {
    let newSource;
    if (files.length === 1) {
      newSource = {
        urlOrFile: files[0],
        description: files[0].name,
      };
    } else {
      newSource = {
        urlOrFile: files,
        description: "data.zarr",
      };
    }
    useViewerStore.setState({ source: newSource });
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/tiff": [".tif", ".tiff"],
    },
  });

  return {
    getRootProps,
    getInputProps
  };
};
