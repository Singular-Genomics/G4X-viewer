import { Box, Typography } from '@mui/material';
import { GlobalSelectionSliders } from './GlobalSelectionSliders';
import { CellMaskLayerToggle } from './CellMaskLayerToggle';
import { useCellSegmentationLayerStore } from '../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useBinaryFilesStore } from '../../../stores/BinaryFilesStore';
import { TranscriptLayerToggle } from './TranscriptLayerToggle';
import { useBrightfieldImagesStore } from '../../../stores/BrightfieldImagesStore';
import { BrightfieldLayerToggle } from './BrightfieldLayerToggle/BrightfieldLayerToggle';
import { useMemo } from 'react';

export const ViewControlsSection = () => {
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
        <Typography sx={sx.subsectionTitle}>Global Selection</Typography>
        <GlobalSelectionSliders />
      </Box>
      <Box>
        <Typography sx={sx.subsectionTitle}>Layers Toggles</Typography>
        <Box sx={sx.togglesSubSection}>
          {!areLayersAvailable && <Typography sx={sx.placeholderMessage}>No active layers available</Typography>}
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
