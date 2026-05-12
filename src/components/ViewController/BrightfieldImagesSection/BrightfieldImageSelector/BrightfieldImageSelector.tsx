import { alpha, Box, Button, RadioGroup, Theme, Typography, useTheme } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useCallback, useState } from 'react';
import {
  getEntryName,
  MAX_NUMBER_OF_IMAGES,
  useBrightfieldImagesStore
} from '../../../../stores/BrightfieldImagesStore';
import { BrightfieldImageSelectorEntry } from './BrightfieldImageSelectorEntry/BrightfieldImageSelectorEntry';
import { BrightfieldImageSelectorProps } from './BrightfieldImageSelector.types';
import { useBrightfieldImageHandler } from './BrightfieldImageSelector.hooks';
import { useSnackbar } from 'notistack';
import { CloudBasedModal } from '../../CloudBasedModal/CloudBasedModal';
import { useTranslation } from 'react-i18next';
import type { AvailableImageEntry } from '../../../../stores/BrightfieldImagesStore/BrightfieldImagesStore.types';

export const BrightfieldImageSelector = ({ images }: BrightfieldImageSelectorProps) => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();
  const { enqueueSnackbar } = useSnackbar();

  const brightfieldImageSource = useBrightfieldImagesStore((store) => store.brightfieldImageSource);
  const activeImageName = brightfieldImageSource?.description ?? '';
  const [isCloudModalOpen, setIsCloudModalOpen] = useState<boolean>(false);
  const [cloudImageUrl, setCloudImageUrl] = useState<string>('');

  const { setActiveImage, addNewFile, availableImages } = useBrightfieldImagesStore();

  const { dropzoneProps } = useBrightfieldImageHandler();

  const handleImageSelect = useCallback(
    (selectedImage: AvailableImageEntry) => {
      const imageName = getEntryName(selectedImage);

      if (imageName === activeImageName) {
        setActiveImage(null);
        return;
      }
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
        message: t('brightfieldImages.invalidFileError'),
        variant: 'error'
      });
      return;
    }

    const index = availableImages.findIndex((entry) => getEntryName(entry) === filename);

    if (index !== -1) {
      enqueueSnackbar({
        message: t('brightfieldImages.duplicateImageError'),
        variant: 'error'
      });
      return;
    }

    addNewFile(url);
    setIsCloudModalOpen(false);
    setCloudImageUrl('');

    enqueueSnackbar({
      message: t('brightfieldImages.imageCloudUploadSuccess', { file: filename }),
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
          <Typography sx={sx.imageSelectorEmptyText}>{t('brightfieldImages.noImages')}</Typography>
        ) : (
          images.map((entry, index) => {
            const entryName = getEntryName(entry);

            return (
              <BrightfieldImageSelectorEntry
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
          {t('brightfieldImages.addImage')}
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
        placeholder={t('brightfieldImages.imageCloudUploadDescription')}
        label={t('brightfieldImages.imageCloudUploadLabel')}
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
