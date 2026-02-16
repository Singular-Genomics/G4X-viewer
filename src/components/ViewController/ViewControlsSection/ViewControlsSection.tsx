import { Box, Typography } from '@mui/material';
import { GlobalSelectionSliders } from './GlobalSelectionSliders';
import { PolygonLayerToggle } from './PolygonLayerToggle';
import { ZoomInput } from './ZoomInput';
import { usePolygonDrawingStore } from '../../../stores/PolygonDrawingStore';
import { useTranslation } from 'react-i18next';

export const ViewControlsSection = () => {
  const { t } = useTranslation();
  const polygonFeatures = usePolygonDrawingStore((store) => store.polygonFeatures);

  return (
    <Box sx={sx.sectionContainer}>
      <Box>
        <Typography sx={sx.subsectionTitle}>{t('viewSettings.globalSelection')}</Typography>
        <GlobalSelectionSliders />
      </Box>
      <Box>
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
  togglesSubSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingLeft: '8px'
  }
};
