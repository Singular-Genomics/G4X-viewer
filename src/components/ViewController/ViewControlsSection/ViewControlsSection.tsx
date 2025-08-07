import { Box, Typography } from '@mui/material';
import { GlobalSelectionSliders } from './GlobalSelectionSliders';
import { CellMaskLayerToggle } from './CellMaskLayerToggle';
import { useCellSegmentationLayerStore } from '../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useBinaryFilesStore } from '../../../stores/BinaryFilesStore';
import { TranscriptLayerToggle } from './TranscriptLayerToggle';
import { useBrightfieldImagesStore } from '../../../stores/BrightfieldImagesStore';
import { BrightfieldLayerToggle } from './BrightfieldLayerToggle/BrightfieldLayerToggle';
import { ZoomInput } from './ZoomInput';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export const ViewControlsSection = () => {
  const { t } = useTranslation();
  const brightfieldImageSource = useBrightfieldImagesStore((store) => store.brightfieldImageSource);
  const files = useBinaryFilesStore((store) => store.files);
  const cellsData = useCellSegmentationLayerStore((store) => store.cellMasksData);

  const areLayersAvailable = useMemo(
    () => files.length || cellsData || brightfieldImageSource,
    [files, cellsData, brightfieldImageSource]
  );

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
      <Box>
        <Typography sx={sx.subsectionTitle}>{t('viewSettings.layerToggles')}</Typography>
        <Box sx={sx.togglesSubSection}>
          {!areLayersAvailable && (
            <Typography sx={sx.placeholderMessage}>{t('viewSettings.noActiveLayers')}</Typography>
          )}
          {!!files.length && <TranscriptLayerToggle />}
          {!!cellsData && <CellMaskLayerToggle />}
          {!!brightfieldImageSource && <BrightfieldLayerToggle />}
        </Box>
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
