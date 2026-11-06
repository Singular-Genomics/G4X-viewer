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
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 172px',
    alignItems: 'start',
    gap: '8px'
  }
};
