import { useDropzone } from "react-dropzone";
import { useViewerStore } from "../../../../stores/ViewerStore";
import { useSnackbar } from "notistack";

export const useImageHandler = () => {
  const { enqueueSnackbar } = useSnackbar();
  
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
    
    if(!/^.+\.(ome\.tiff|zarr)$/.test(newSource.description)) {
      enqueueSnackbar({ message: "Invalid input file name. Only .ome.tiff and .zarr extensions allowed", variant: 'error'});
      return
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
