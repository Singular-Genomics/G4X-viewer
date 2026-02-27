import { Box } from '@mui/material';
import ZarrCloudUploadButton from './ZarrCloudUploadButton/ZarrCloudUploadButton';
import { LocalFolderButton } from './LocalFolderButton';

export const SourceFilesSection = () => {
  return (
    <Box sx={sx.sourceFilesSectionContainer}>
      <ZarrCloudUploadButton />
      <LocalFolderButton />
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
