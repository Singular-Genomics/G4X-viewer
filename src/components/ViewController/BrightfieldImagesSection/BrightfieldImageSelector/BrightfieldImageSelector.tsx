import { alpha, Box, Button, RadioGroup, Theme, Typography, useTheme } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useCallback, useState } from 'react';
import { MAX_NUMBER_OF_IMAGES, useBrightfieldImagesStore } from '../../../../stores/BrightfieldImagesStore';
import { BrightfieldImageSelectorEntry } from './BrightfieldImageSelectorEntry/BrightfieldImageSelectorEntry';
import { BrightfieldImageSelectorProps } from './BrightfieldImageSelector.types';
import { useBrightfieldImageHandler } from './BrightfieldImageSelector.hooks';
import { useSnackbar } from 'notistack';
import { CloudBasedModal } from '../../CloudBasedModal/CloudBasedModal';

export const BrightfieldImageSelector = ({ images }: BrightfieldImageSelectorProps) => {
  const theme = useTheme();
  const sx = styles(theme);
  const { enqueueSnackbar } = useSnackbar();

  const [activeImageName, setActiveImageName] = useState<string>('');
  const [isCloudModalOpen, setIsCloudModalOpen] = useState<boolean>(false);
  const [cloudImageUrl, setCloudImageUrl] = useState<string>('');

  const { setActiveImage, removeFileByName, addNewFile, availableImages } = useBrightfieldImagesStore();

  const { dropzoneProps } = useBrightfieldImageHandler();

  const handleImageRemove = useCallback(
    (imageName: string) => {
      if (imageName === activeImageName) {
        setActiveImageName('');
        setActiveImage(null);
      }

      removeFileByName(imageName);
    },
    [setActiveImage, removeFileByName, activeImageName]
  );

  const handleImageSelect = useCallback(
    (selectedImage: File | string) => {
      const imageName =
        typeof selectedImage === 'string' ? selectedImage.split('/').pop() || selectedImage : selectedImage.name;

      if (imageName === activeImageName) {
        setActiveImageName('');
        setActiveImage(null);
        return;
      }
      setActiveImageName(imageName);
      setActiveImage(selectedImage);
    },
    [activeImageName, setActiveImage]
  );

  const handleCloudUploadClick = () => {
    setIsCloudModalOpen(true);
  };

  const handleCloudModalClose = () => {
    setIsCloudModalOpen(false);
    setCloudImageUrl('');
  };

  const handleCloudSubmit = (url: string) => {
    const filename = url.split('/').pop() || url;

    if (!/^.+\.(ome\.tiff|tif)$/.test(filename)) {
      enqueueSnackbar({
        message: 'Invalid input file name. Only .ome.tiff and .tif extensions allowed',
        variant: 'error'
      });
      return;
    }

    const index = availableImages.findIndex((entry) => {
      if (typeof entry === 'string') {
        return entry.split('/').pop() === filename || entry === filename;
      }
      return entry.name === filename;
    });

    if (index !== -1) {
      enqueueSnackbar({
        message: 'Image with same name already has been loaded',
        variant: 'error'
      });
      return;
    }

    addNewFile(url);
    setIsCloudModalOpen(false);
    setCloudImageUrl('');

    enqueueSnackbar({
      message: `Successfully loaded fH&E image from URL: ${filename}`,
      variant: 'success'
    });
  };

  return (
    <Box sx={{ padding: '0 8px' }}>
      <RadioGroup
        sx={sx.imageSelectorBody}
        value={activeImageName}
      >
        {!images.length ? (
          <Typography sx={sx.imageSelectorEmptyText}>No fH&E images have been loaded</Typography>
        ) : (
          images.map((entry, index) => {
            const entryName = typeof entry === 'string' ? entry.split('/').pop() || entry : entry.name;

            return (
              <BrightfieldImageSelectorEntry
                key={index}
                imageEntry={entry}
                isActive={entryName === activeImageName}
                entryType={typeof entry === 'string' ? 'cloud-upload' : 'local-file'}
                onSelectImage={handleImageSelect}
                onRemoveImage={handleImageRemove}
              />
            );
          })
        )}
      </RadioGroup>
      <Box sx={sx.buttonsContainer}>
        <Button
          variant="outlined"
          sx={sx.dropzoneButton}
          size="small"
          disabled={images.length >= MAX_NUMBER_OF_IMAGES}
          {...dropzoneProps.getRootProps()}
        >
          <input {...dropzoneProps.getInputProps()} />
          Add fH&E Image
        </Button>
        <Button
          variant="outlined"
          sx={sx.cloudUploadButton}
          size="small"
          disabled={images.length >= MAX_NUMBER_OF_IMAGES}
          onClick={handleCloudUploadClick}
          startIcon={<CloudUploadIcon />}
        >
          Cloud Upload
        </Button>
      </Box>

      <CloudBasedModal
        isOpen={isCloudModalOpen}
        onClose={handleCloudModalClose}
        onSubmit={handleCloudSubmit}
        url={cloudImageUrl}
        onUrlChange={setCloudImageUrl}
        title="Cloud Upload"
        placeholder="Enter URL to .ome.tiff or .tif file"
        label="fH&E Image URL"
      />
    </Box>
  );
};

const styles = (theme: Theme) => ({
  buttonsContainer: {
    display: 'flex',
    width: '100%',
    position: 'relative'
  },
  dropzoneButton: {
    flex: 1,
    borderStyle: 'solid',
    backgroundColor: theme.palette.gx.primary.white,
    height: '40px',
    borderRadius: '0 0 0 8px',
    borderColor: theme.palette.gx.accent.greenBlue,
    color: theme.palette.gx.accent.greenBlue,
    zIndex: 1,
    '&:hover': {
      borderColor: theme.palette.gx.accent.greenBlue,
      backgroundColor: alpha(theme.palette.gx.accent.greenBlue, 0.2)
    }
  },
  cloudUploadButton: {
    flex: 1,
    borderStyle: 'solid',
    backgroundColor: theme.palette.gx.primary.white,
    height: '40px',
    borderRadius: '0 0 8px 0',
    borderColor: theme.palette.gx.accent.greenBlue,
    color: theme.palette.gx.accent.greenBlue,
    marginLeft: '-1px',
    position: 'relative',
    '&:hover': {
      borderColor: theme.palette.gx.accent.greenBlue,
      backgroundColor: alpha(theme.palette.gx.accent.greenBlue, 0.2)
    }
  },
  imageSelectorBody: {
    display: 'flex',
    gap: '8px',
    flexDirection: 'column',
    padding: '8px',
    backgroundColor: theme.palette.gx.primary.white,
    borderRadius: '8px 8px 0 0'
  },
  imageSelectorEmptyText: {
    textAlign: 'center',
    fontWeight: 700
  }
});
