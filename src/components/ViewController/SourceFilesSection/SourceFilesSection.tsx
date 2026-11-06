import { Box } from '@mui/material';
import { ShareSettingsButton } from '../../ShareSettingsButton';
import { SummaryButton } from '../../SummaryButton';
import { DetailsPopup } from '../../DetailsPopup';
import ZarrSourceInput from './ZarrSourceInput/ZarrSourceInput';
import { LocalFolderButton } from './LocalFolderButton';

export const SourceFilesSection = () => {
  return (
    <Box sx={sx.sourceFilesSectionContainer}>
      <Box sx={sx.sourceInputRow}>
        <ZarrSourceInput />
        <LocalFolderButton />
      </Box>
      <Box sx={sx.actionsRow}>
        <ShareSettingsButton />
        <SummaryButton />
        <DetailsPopup />
      </Box>
    </Box>
  );
};

const sx = {
  sourceFilesSectionContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  actionsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '8px'
  },
  sourceInputRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 172px',
    alignItems: 'start',
    gap: '8px'
  }
};
