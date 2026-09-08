import { Box, Typography } from '@mui/material';
import { GlobalSelectionSliders } from './GlobalSelectionSliders';
import { ImageDetails } from './ImageDetails';
import { PolygonLayerToggle } from './PolygonLayerToggle';
import { ZoomInput } from './ZoomInput';
import { usePolygonDrawingStore } from '../../../stores/PolygonDrawingStore';
import { useTranslation } from 'react-i18next';
import { OverviewToggle } from '../ChannelsSettingsSection/OverviewToggle';

export const ViewControlsSection = () => {
  const { t } = useTranslation();
  const polygonFeatures = usePolygonDrawingStore((store) => store.polygonFeatures);
  return (
    <Box sx={sx.sectionContainer}>
      <ImageDetails />
      <GlobalSelectionSliders />
      <Box sx={sx.zoomControlContainer}>
        <Typography sx={sx.subsectionTitle}>{t('viewSettings.zoomControl')}</Typography>
        <ZoomInput />
      </Box>
      {!!polygonFeatures.length && (
        <Box>
          <Typography sx={sx.subsectionTitle}>{t('viewSettings.layerToggles')}</Typography>
          <Box sx={sx.togglesSubSection}>
            <PolygonLayerToggle />
          </Box>
        </Box>
      )}
      <Box sx={sx.togglesSubSection}>
        <OverviewToggle />
      </Box>
    </Box>
  );
};

const sx = {
  sectionContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  subsectionTitle: {
    fontWeight: 700,
    paddingLeft: '8px',
    marginBottom: '8px'
  },
  zoomControlContainer: {
    marginTop: '8px'
  },
  togglesSubSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingLeft: '8px'
  }
};
