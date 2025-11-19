import { useDropzone } from 'react-dropzone';
import { GeneralDetailsType, useViewerStore } from '../../../../stores/ViewerStore';
import { useSnackbar } from 'notistack';
import { useTranslation } from 'react-i18next';

export const useGeneralDetailsHandler = () => {
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();

  const onDrop = async (files: File[]) => {
    if (files.length !== 1) {
      enqueueSnackbar({
        message: t('sourceFiles.metadataMultipleFileError'),
        variant: 'error'
      });
      return;
    }

    const file = files[0];
    if (!file.name.endsWith('.json')) {
      enqueueSnackbar({
        message: t('sourceFiles.metadataInvalidFile'),
        variant: 'error'
      });
      return;
    }

    try {
      const text = await file.text();

      if (text.includes('NaN') || text.includes('Infinity') || text.includes('-Infinity')) {
        enqueueSnackbar({
          message: t('sourceFiles.metadataInvalidJsonError'),
          variant: 'error'
        });
        return;
      }

      const jsonData = JSON.parse(text);

      const generalDetails: GeneralDetailsType = {
        fileName: file.name,
        data: jsonData
      };

      useViewerStore.getState().setGeneralDetails(generalDetails);

      enqueueSnackbar({
        message: t('sourceFiles.metadataUploadSuccess'),
        variant: 'success'
      });
    } catch (error) {
      const errorMessage = (error as Error).message;
      if (errorMessage.includes('NaN') || errorMessage.includes('Unexpected token')) {
        enqueueSnackbar({
          message: t('sourceFiles.metadataInvalidJsonError'),
          variant: 'error'
        });
      } else {
        enqueueSnackbar({
          message: t('sourceFiles.metadataParsingError', { message: errorMessage }),
          variant: 'error'
        });
      }
    }
  };

  const dropzoneProps = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json']
    },
    multiple: false
  });

  return dropzoneProps;
};
