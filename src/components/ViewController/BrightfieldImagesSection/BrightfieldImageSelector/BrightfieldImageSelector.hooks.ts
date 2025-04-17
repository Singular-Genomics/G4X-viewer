import { useDropzone } from 'react-dropzone';
import { useSnackbar } from 'notistack';
import { useBrightfieldImagesStore } from '../../../../stores/BrightfieldImagesStore';

export const useBrightfieldImageHandler = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { addNewFile, availableImages } = useBrightfieldImagesStore();

  const onDrop = (files: File[]) => {
    if (files.length !== 1) {
      enqueueSnackbar({
        message: 'Invalid input file. Only single .ome.tiff files allowed',
        variant: 'error'
      });
      return;
    }

    const imageFile = files[0];

    if (!/^.+\.(ome\.tiff|tif)$/.test(imageFile.name)) {
      enqueueSnackbar({
        message: 'Invalid input file name. Only .ome.tiff allowed',
        variant: 'error'
      });
      return;
    }

    const index = availableImages.findIndex((entry) => {
      if (typeof entry === 'string') {
        return entry.split('/').pop() === imageFile.name || entry === imageFile.name;
      }
      return entry.name === imageFile.name;
    });

    if (index !== -1) {
      enqueueSnackbar({
        message: 'Image with same name already has already been loaded',
        variant: 'error'
      });
      return;
    }

    addNewFile(imageFile);
  };

  const dropzoneProps = useDropzone({
    onDrop,
    accept: {
      'image/tiff': ['.tif', '.tiff']
    }
  });

  return {
    dropzoneProps
  };
};
