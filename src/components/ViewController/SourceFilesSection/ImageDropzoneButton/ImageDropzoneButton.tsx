import { Box } from '@mui/material';
import { useViewerStore } from '../../../../stores/ViewerStore';
import { GxDropzoneButton } from '../../../../shared/components/GxDropzoneButton';
import { useImageHandler } from './helpers/useImageHandler';
import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { useBinaryFilesStore } from '../../../../stores/BinaryFilesStore';
import { useTranscriptLayerStore } from '../../../../stores/TranscriptLayerStore';
import { useCellSegmentationLayerStore } from '../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useBrightfieldImagesStore } from '../../../../stores/BrightfieldImagesStore';
import { CloudBasedModal } from '../../CloudBasedModal/CloudBasedModal';
import { useTranslation } from 'react-i18next';
import { IMAGE_URL_PARAM } from '../../../../hooks/useCloudImageLoader.hook';

const getInitialCloudImageUrl = () => new URLSearchParams(window.location.search).get(IMAGE_URL_PARAM) || '';

export default function ImageDropzoneButton() {
  const { t } = useTranslation();
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [cloudImageUrl, setCloudImageUrl] = useState(getInitialCloudImageUrl);

  const handleDropzoneUpload = () => {
    setCloudImageUrl('');
    const url = new URL(window.location.href);
    url.searchParams.delete(IMAGE_URL_PARAM);
    window.history.replaceState({}, '', url);
  };

  const dropzoneProps = useImageHandler(handleDropzoneUpload);
  const imageName = useViewerStore((store) => store.source?.description);
  const { enqueueSnackbar } = useSnackbar();

  const handleCloudUploadClick = () => {
    setIsPopupOpen(true);
  };

  const handleClose = () => {
    setIsPopupOpen(false);
  };

  const handleSubmit = (cloudImageUrl: string) => {
    const filename = cloudImageUrl.split('/').pop() || cloudImageUrl;

    if (!/^.+\.(ome\.tiff|tif|zarr)$/.test(filename)) {
      enqueueSnackbar({
        message: t('sourceFiles.imageInvalidFile'),
        variant: 'error'
      });
      return;
    }

    const newSource = {
      urlOrFile: cloudImageUrl,
      description: filename
    };

    useViewerStore.setState({ source: newSource });
    useBinaryFilesStore.getState().reset();
    useTranscriptLayerStore.getState().reset();
    useCellSegmentationLayerStore.getState().reset();
    useBrightfieldImagesStore.getState().reset();

    setIsPopupOpen(false);

    const url = new URL(window.location.href);
    url.searchParams.delete(IMAGE_URL_PARAM);
    window.history.replaceState({}, '', url);

    enqueueSnackbar({
      message: t('sourceFiles.imageSuccess', { filename: filename }),
      variant: 'success'
    });
  };

  return (
    <Box>
      <GxDropzoneButton
        labelTitle={t('sourceFiles.imageInputLabel')}
        labelText={imageName}
        placeholderText={t('sourceFiles.imagePlaceholder')}
        buttonText={t('sourceFiles.imageUploadButton')}
        onCloudUploadClick={handleCloudUploadClick}
        isCloudUploaded={!!cloudImageUrl}
        tooltipText={t('tooltips.sourceFiles.imageUploadButton')}
        cloudUploadTooltipText={t('tooltips.sourceFiles.cloudUploadButton')}
        {...dropzoneProps}
      />

      <CloudBasedModal
        isOpen={isPopupOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        url={cloudImageUrl}
        onUrlChange={setCloudImageUrl}
        title={t('general.cloudUpload')}
        placeholder={t('sourceFiles.imageInputPlaceholder')}
        label={t('general.imageURL')}
      />
    </Box>
  );
}
