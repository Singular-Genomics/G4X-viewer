import { Box } from '@mui/material';
import ZarrSourceInput from './ZarrSourceInput/ZarrSourceInput';
import { LocalFolderButton } from './LocalFolderButton';

export const SourceFilesSection = () => {
  return (
    <Box sx={sx.sourceFilesSectionContainer}>
      <ZarrSourceInput />
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
