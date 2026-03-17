import { Box, Typography } from '@mui/material';
import { GlobalSelectionSliders } from './GlobalSelectionSliders';
import { CellMaskLayerToggle } from './CellMaskLayerToggle';
import { useCellSegmentationLayerStore } from '../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useZarrDataStore } from '../../../stores/ZarrDataStore';
import { TranscriptLayerToggle } from './TranscriptLayerToggle';
import { useImageOverlaysStore } from '../../../stores/ImageOverlaysStore';
import { BrightfieldLayerToggle } from './BrightfieldLayerToggle/BrightfieldLayerToggle';
import { PolygonLayerToggle } from './PolygonLayerToggle';
import { ZoomInput } from './ZoomInput';
import { useMemo } from 'react';
import { usePolygonDrawingStore } from '../../../stores/PolygonDrawingStore';
import { useTranslation } from 'react-i18next';
import { OverviewToggle } from '../ChannelsSettingsSection/OverviewToggle';

export const ViewControlsSection = () => {
  const { t } = useTranslation();
  const brightfieldImageSource = useImageOverlaysStore((store) => store.brightfieldImageSource);
  const hasTranscriptsData = useZarrDataStore((store) => store.hasTranscriptsData);
  const cellsData = useCellSegmentationLayerStore((store) => store.cellMasksData);
  const polygonFeatures = usePolygonDrawingStore((store) => store.polygonFeatures);
  const hasSegmentationData = !!cellsData?.length;

  const areLayersAvailable = useMemo(
    () => hasTranscriptsData || hasSegmentationData || !!brightfieldImageSource || !!polygonFeatures.length,
    [hasTranscriptsData, hasSegmentationData, brightfieldImageSource, polygonFeatures.length]
  );
  return (
    <Box sx={sx.sectionContainer}>
      <GlobalSelectionSliders />
      <Box>
        <Typography sx={sx.subsectionTitle}>{t('viewSettings.zoomControl')}</Typography>
        <ZoomInput />
      </Box>
      <Box>
        <Typography sx={sx.subsectionTitle}>{t('viewSettings.layerToggles')}</Typography>
        <Box sx={sx.togglesSubSection}>
          {!areLayersAvailable && (
            <Typography sx={sx.placeholderMessage}>{t('viewSettings.noActiveLayers')}</Typography>
          )}
          {hasTranscriptsData && <TranscriptLayerToggle />}
          {hasSegmentationData && <CellMaskLayerToggle />}
          {!!brightfieldImageSource && <BrightfieldLayerToggle />}
          {!!polygonFeatures.length && <PolygonLayerToggle />}
        </Box>
      </Box>
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
  togglesSubSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingLeft: '8px'
  },
  placeholderMessage: {
    textAlign: 'center'
  }
};
