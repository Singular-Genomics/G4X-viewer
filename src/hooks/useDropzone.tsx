import { useBinaryFilesStore } from "../stores/BinaryFilesStore";
import { useViewerStore } from "../stores/ViewerStore";
import { useDropzone as useReactDropzone } from 'react-dropzone';

export const useDropzone = () => {
  const handleSubmitFile = (files: File[]) => {
    let newSource;
    if (files.length === 1) {
      newSource = {
        urlOrFile: files[0],
        description: files[0].name
      };
    } else {
      newSource = {
        urlOrFile: files,
        description: 'data.zarr'
      };
    }

    useViewerStore.setState({ source: newSource });
    useBinaryFilesStore.setState({ files: [], fileName: '' })
  };
  return useReactDropzone({
    onDrop: handleSubmitFile
  });
};
