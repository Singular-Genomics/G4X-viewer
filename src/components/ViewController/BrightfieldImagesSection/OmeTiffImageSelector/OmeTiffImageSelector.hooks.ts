import { useDropzone } from 'react-dropzone';
import { useSnackbar } from 'notistack';
import { MAX_NUMBER_OF_IMAGES, useBrightfieldImagesStore } from '../../../../stores/BrightfieldImagesStore';
import { useTranslation } from 'react-i18next';

export const useOmeTiffImageHandler = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const { addOmeTiffFile, availableOmeTiffImages } = useBrightfieldImagesStore();

  const onDrop = (files: File[]) => {
    if (files.length !== 1) {
      enqueueSnackbar({
        message: t('brightfieldImages.imageUploadMultipleError'),
        variant: 'error'
      });
      return;
    }

    const imageFile = files[0];

    if (!/^.+\.(ome\.tiff|tif)$/.test(imageFile.name)) {
      enqueueSnackbar({
        message: t('brightfieldImages.invalidFileError'),
        variant: 'error'
      });
      return;
    }

    if (availableOmeTiffImages.length >= MAX_NUMBER_OF_IMAGES) {
      return;
    }

    const index = availableOmeTiffImages.findIndex((entry) => {
      if (typeof entry === 'string') {
        return entry.split('/').pop() === imageFile.name || entry === imageFile.name;
      }
      return entry.name === imageFile.name;
    });

    if (index !== -1) {
      enqueueSnackbar({
        message: t('brightfieldImages.duplicateImageError'),
        variant: 'error'
      });
      return;
    }

    addOmeTiffFile(imageFile);
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
