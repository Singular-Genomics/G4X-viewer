import { alpha, Box, Button, RadioGroup, Theme, Typography, useTheme } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useCallback, useState } from 'react';
import { getEntryName, MAX_NUMBER_OF_IMAGES, useImageOverlaysStore } from '../../../../stores/ImageOverlaysStore';
import { OmeTiffSelectorEntry } from '../OmeTiffSelectorEntry/OmeTiffSelectorEntry';
import { OmeTiffImageSelectorProps } from './OmeTiffImageSelector.types';
import { useOmeTiffImageHandler } from './OmeTiffImageSelector.hooks';
import { useSnackbar } from 'notistack';
import { CloudBasedModal } from '../../CloudBasedModal/CloudBasedModal';
import { useTranslation } from 'react-i18next';

export const OmeTiffImageSelector = ({ images }: OmeTiffImageSelectorProps) => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const omeTiffImageSource = useImageOverlaysStore((store) => store.omeTiffImageSource);
  const activeImageName = omeTiffImageSource?.description ?? '';
  const [isCloudModalOpen, setIsCloudModalOpen] = useState<boolean>(false);
  const [cloudImageUrl, setCloudImageUrl] = useState<string>('');

  const { setActiveOmeTiffImage, addOmeTiffFile, availableOmeTiffImages } = useImageOverlaysStore();

  const { dropzoneProps } = useOmeTiffImageHandler();

  const handleImageSelect = useCallback(
    (selectedImage: File | string) => {
      const imageName = getEntryName(selectedImage);

      if (imageName === activeImageName) {
        setActiveOmeTiffImage(null);
        return;
      }
      setActiveOmeTiffImage(selectedImage);
    },
    [activeImageName, setActiveOmeTiffImage]
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
        message: t('imageOverlays.invalidFileError'),
        variant: 'error'
      });
      return;
    }

    const index = availableOmeTiffImages.findIndex((entry) => {
      if (typeof entry === 'string') {
        return entry.split('/').pop() === filename || entry === filename;
      }
      return entry.name === filename;
    });

    if (index !== -1) {
      enqueueSnackbar({
        message: t('imageOverlays.duplicateImageError'),
        variant: 'error'
      });
      return;
    }

    addOmeTiffFile(url);
    setIsCloudModalOpen(false);
    setCloudImageUrl('');

    enqueueSnackbar({
      message: t('imageOverlays.imageCloudUploadSuccess', { file: filename }),
      variant: 'success'
    });
  };

  return (
    <Box sx={sx.container}>
      <RadioGroup
        sx={sx.imageSelectorBody}
        value={activeImageName}
      >
        {!images.length ? (
          <Typography sx={sx.imageSelectorEmptyText}>{t('imageOverlays.noOmeTiffImages')}</Typography>
        ) : (
          images.map((entry, index) => {
            const entryName = getEntryName(entry);

            return (
              <OmeTiffSelectorEntry
                key={index}
                imageEntry={entry}
                isActive={entryName === activeImageName}
                entryType={typeof entry === 'string' ? 'cloud-upload' : 'local-file'}
                onSelectImage={handleImageSelect}
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
          {t('imageOverlays.addOmeTiffImage')}
        </Button>
        <Button
          variant="outlined"
          sx={sx.cloudUploadButton}
          size="small"
          disabled={images.length >= MAX_NUMBER_OF_IMAGES}
          onClick={handleCloudUploadClick}
          startIcon={<CloudUploadIcon />}
        >
          {t('general.cloudUpload')}
        </Button>
      </Box>

      <CloudBasedModal
        isOpen={isCloudModalOpen}
        onClose={handleCloudModalClose}
        onSubmit={handleCloudSubmit}
        url={cloudImageUrl}
        onUrlChange={setCloudImageUrl}
        title={t('general.cloudUpload')}
        placeholder={t('imageOverlays.imageCloudUploadDescription')}
        label={t('imageOverlays.omeTiffCloudUploadLabel')}
      />
    </Box>
  );
};

const styles = (theme: Theme) => ({
  container: {
    padding: '0 8px'
  },
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
