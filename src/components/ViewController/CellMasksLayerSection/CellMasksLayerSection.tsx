import { Box, CircularProgress, Typography } from '@mui/material';
import { useCellSegmentationLayerStore } from '../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useShallow } from 'zustand/react/shallow';
import { CellMasksFillSettings } from './CellMasksFillSettings';
import { CellMasksBoundarySettings } from './CellMasksBoundarySettings';
import { CellsFilter } from './CellsFilter';
import { GraphFilters } from './GraphFilters/GraphFilters';
import { useTranslation } from 'react-i18next';
import { SegmentationSelectors } from './SegmentationSelectors';

export const CellMasksLayerSection = () => {
  const { t } = useTranslation();
  const [isCellLayerOn, cellMasksData] = useCellSegmentationLayerStore(
    useShallow((store) => [store.isCellLayerOn, store.cellMasksData])
  );

  if (isCellLayerOn && cellMasksData === null) {
    return (
      <Box sx={sx.loadingContainer}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  return (
    <Box
      component="fieldset"
      disabled={!isCellLayerOn}
      inert={!isCellLayerOn}
      aria-disabled={!isCellLayerOn}
      sx={sx.sectionContainer}
    >
      <SegmentationSelectors />
      <Box>
        <Box sx={sx.subsectionWrapper}>
          <Typography sx={sx.subsectionTitle}>{t('segmentationSettings.cellAppearanceLabel')}</Typography>
        </Box>
        <CellMasksFillSettings />
        <CellMasksBoundarySettings />
      </Box>
      <Box>
        <Box sx={sx.subsectionWrapper}>
          <Typography sx={sx.subsectionTitle}>{t('segmentationSettings.cellFiltersLabel')}</Typography>
        </Box>
        <CellsFilter />
      </Box>
      <Box>
        <Box sx={sx.subsectionWrapper}>
          <Typography sx={sx.subsectionTitle}>{t('segmentationSettings.graphFiltersLabel')}</Typography>
        </Box>
        <GraphFilters />
      </Box>
    </Box>
  );
};

const sx = {
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    padding: '16px 0'
  },
  sectionContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    border: 0,
    padding: 0,
    margin: 0,
    minWidth: 0,
    '&:disabled': {
      filter: 'grayscale(1)',
      opacity: 0.5
    }
  },
  subsectionWrapper: {
    display: 'flex',
    gap: '8px'
  },
  subsectionTitle: {
    fontWeight: 700,
    paddingLeft: '8px',
    marginBottom: '8px'
  }
};
