import { Box } from '@mui/material';
import ZarrSourceInput from './ZarrSourceInput/ZarrSourceInput';

export const SourceFilesSection = () => {
  return (
    <Box sx={sx.sourceFilesSectionContainer}>
      <ZarrSourceInput />
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
