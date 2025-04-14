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

export default function ImageDropzoneButton() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [cloudImageUrl, setCloudImageUrl] = useState('');

  const handleDropzoneUpload = () => {
    setCloudImageUrl('');
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
        message: 'Invalid input file name. Only .ome.tiff and .zarr extensions allowed',
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

    enqueueSnackbar({
      message: `Successfully loaded image from URL: ${filename}`,
      variant: 'success'
    });
  };

  return (
    <Box>
      <GxDropzoneButton
        labelTitle="Image File Name"
        labelText={imageName}
        buttonText="Upload image file"
        onCloudUploadClick={handleCloudUploadClick}
        isCloudUploaded={!!cloudImageUrl}
        {...dropzoneProps}
      />

      <CloudBasedModal
        isOpen={isPopupOpen}
        onClose={handleClose}
        onSubmit={handleSubmit}
        url={cloudImageUrl}
        onUrlChange={setCloudImageUrl}
        title="Cloud Upload"
        placeholder="Enter URL to .ome.tiff or .zarr file"
        label="Image URL"
      />
    </Box>
  );
}
