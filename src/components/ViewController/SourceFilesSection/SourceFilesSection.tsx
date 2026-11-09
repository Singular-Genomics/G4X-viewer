import { Box, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useViewerStore } from '../../../stores/ViewerStore';
import { ShareSettingsButton } from '../../ShareSettingsButton';
import { SummaryButton } from '../../SummaryButton';
import { DetailsPopup } from '../../DetailsPopup';
import ZarrSourceInput from './ZarrSourceInput/ZarrSourceInput';
import { LocalFolderButton } from './LocalFolderButton';

export const SourceFilesSection = () => {
  const { t } = useTranslation();
  const storeName = useViewerStore((store) => store.source?.description);

  return (
    <Box sx={sx.sourceFilesSectionContainer}>
      <Box sx={sx.sourceInputRow}>
        <ZarrSourceInput />
        <LocalFolderButton />
      </Box>
      <Box sx={sx.loadedStoreGroup}>
        {storeName && (
          <Typography sx={sx.loadedStoreLabel}>
            {t('sourceFiles.loadedZarrStore')}: {storeName}
          </Typography>
        )}
        <Box sx={sx.actionsRow}>
          <ShareSettingsButton />
          <SummaryButton />
          <DetailsPopup />
        </Box>
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
  loadedStoreGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    minWidth: 0
  },
  loadedStoreLabel: {
    fontSize: '1rem',
    fontWeight: 700,
    overflowWrap: 'anywhere'
  },
  sourceInputRow: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 172px',
    alignItems: 'start',
    gap: '8px'
  }
};
