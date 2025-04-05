import { alpha, Box, Button, RadioGroup, Theme, Typography, useTheme } from '@mui/material';

import { useCallback, useState } from 'react';
import { MAX_NUMBER_OF_IMAGES, useBrightfieldImagesStore } from '../../../../stores/BrightfieldImagesStore';
import { BrightfieldImageSelectorEntry } from './BrightfieldImageSelectorEntry/BrightfieldImageSelectorEntry';
import { BrightfieldImageSelectorProps } from './BrightfieldImageSelector.types';
import { useBrightfieldImageHandler } from './BrightfieldImageSelector.hooks';

export const BrightfieldImageSelector = ({ images }: BrightfieldImageSelectorProps) => {
  const theme = useTheme();
  const sx = styles(theme);

  const [activeImageName, setActiveImageName] = useState<string>('');
  const { setActiveImage, removeFileByName } = useBrightfieldImagesStore();

  const { getInputProps, getRootProps } = useBrightfieldImageHandler();

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
    (selectedImage: File) => {
      if (selectedImage.name === activeImageName) {
        setActiveImageName('');
        setActiveImage(null);
        return;
      }
      setActiveImageName(selectedImage.name);
      setActiveImage(selectedImage);
    },
    [activeImageName, setActiveImage]
  );

  return (
    <Box sx={{ padding: '0 8px' }}>
      <RadioGroup
        sx={sx.imageSelectorBody}
        value={activeImageName}
      >
        {!images.length ? (
          <Typography sx={sx.imageSelectorEmptyText}>No H&E images have been loaded</Typography>
        ) : (
          images.map((entry, index) => (
            <BrightfieldImageSelectorEntry
              key={index}
              imageEntry={entry}
              onSelectImage={handleImageSelect}
              onRemoveImage={handleImageRemove}
            />
          ))
        )}
      </RadioGroup>
      <Button
        fullWidth
        variant="outlined"
        sx={sx.dropDownButton}
        size="small"
        disabled={images.length >= MAX_NUMBER_OF_IMAGES}
        {...getRootProps()}
      >
        <input {...getInputProps()} />+ Add H&E Image
      </Button>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  dropDownButton: {
    borderStyle: 'solid',
    backgroundColor: theme.palette.gx.primary.white,
    width: '100%',
    height: '40px',
    borderRadius: '0 0 8px 8px',
    borderColor: theme.palette.gx.accent.greenBlue,
    color: theme.palette.gx.accent.greenBlue,
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
