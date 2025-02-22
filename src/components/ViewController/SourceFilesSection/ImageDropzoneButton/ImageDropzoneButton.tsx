import { Box } from '@mui/material';
import { useViewerStore } from '../../../../stores/ViewerStore';
import { GxDropzoneButton } from '../../../../shared/components/GxDropzoneButton';
import { useImageHandler } from './useImageHandler';

export default function ImageDropzoneButton() {
  const { getRootProps, getInputProps } = useImageHandler();
  const imageName = useViewerStore((store) => store.source?.description);

  return (
    <Box>
      <GxDropzoneButton
        getRootProps={getRootProps}
        getInputProps={getInputProps}
        labelTitle="Image File Name"
        labelText={imageName}
        buttonText="Upload image file"
      />
    </Box>
  );
}
