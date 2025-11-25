import { Box, Theme, Tooltip, Typography, tooltipClasses } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { useCellSegmentationLayerStore } from '../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useShallow } from 'zustand/react/shallow';
import { CellMasksFillSettings } from './CellMasksFillSettings';
import { CellMasksBoundarySettings } from './CellMasksBoundarySettings';
import { CellsFilter } from './CellsFilter';
import { GraphFilters } from './GraphFilters/GraphFilters';
import { useTranslation } from 'react-i18next';

const DisabledLayerWarning = () => {
  const { t } = useTranslation();
  return (
    <Tooltip
      title={t('segmentationSettings.disabledLayerWarning')}
      placement="top"
      arrow
      slotProps={{ popper: { sx: sx.warningTooltip } }}
    >
      <WarningIcon sx={sx.warningIcon} />
    </Tooltip>
  );
};

export const CellMasksLayerSection = () => {
  const { t } = useTranslation();
  const [isCellLayerOn, isCellFillOn, showBoundary, isCellNameFilterOn] = useCellSegmentationLayerStore(
    useShallow((store) => [store.isCellLayerOn, store.isCellFillOn, store.showBoundary, store.isCellNameFilterOn])
  );

  return (
    <Box sx={sx.sectionContainer}>
      <Box>
        <Box sx={sx.subsectionWrapper}>
          <Typography sx={sx.subsectionTitle}>{t('segmentationSettings.cellFillLabel')}</Typography>
          {!isCellLayerOn && isCellFillOn && <DisabledLayerWarning />}
        </Box>
        <CellMasksFillSettings />
      </Box>
      <Box>
        <Box sx={sx.subsectionWrapper}>
          <Typography sx={sx.subsectionTitle}>{t('segmentationSettings.boundaryLabel')}</Typography>
          {!isCellLayerOn && showBoundary && <DisabledLayerWarning />}
        </Box>
        <CellMasksBoundarySettings />
      </Box>
      <Box>
        <Box sx={sx.subsectionWrapper}>
          <Typography sx={sx.subsectionTitle}>{t('segmentationSettings.cellFiltersLabel')}</Typography>
          {!isCellLayerOn && isCellNameFilterOn && <DisabledLayerWarning />}
        </Box>
        <CellsFilter />
      </Box>
      <Box>
        <Box sx={sx.subsectionWrapper}>
          <Typography sx={sx.subsectionTitle}>{t('segmentationSettings.graphFiltersLabel')}</Typography>
          {!isCellLayerOn && isCellNameFilterOn && <DisabledLayerWarning />}
        </Box>
        <GraphFilters />
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
  subsectionWrapper: {
    display: 'flex',
    gap: '8px'
  },
  subsectionTitle: {
    fontWeight: 700,
    paddingLeft: '8px',
    marginBottom: '8px'
  },
  warningIcon: {
    color: (theme: Theme) => theme.palette.gx.accent.darkGold,
    border: ''
  },
  warningTooltip: {
    [`&.${tooltipClasses.popper}[data-popper-placement*="top"] .${tooltipClasses.tooltip}`]: {
      marginBottom: '0px'
    }
  }
};
