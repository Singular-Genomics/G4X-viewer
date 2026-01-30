import { Box } from '@mui/material';
import ZarrCloudUploadButton from './ZarrCloudUploadButton/ZarrCloudUploadButton';

export const SourceFilesSection = () => {
  return (
    <Box sx={sx.sourceFilesSectionContainer}>
      <ZarrCloudUploadButton />
      {/* <ImageDropzoneButton /> */}
    </Box>
  );
};

const sx = {
  sourceFilesSectionContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  }
};
