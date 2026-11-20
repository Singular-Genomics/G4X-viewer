import { Box, Theme, Tooltip, Typography, tooltipClasses } from '@mui/material';
import { PointSizeSlider } from './PointSizeSlider';
import { PointOutlineToggle } from './PointOutlineToggle';
import { PointFilter } from './PointsFilter/PointFilter';
import WarningIcon from '@mui/icons-material/Warning';
import { useTranscriptSource } from './TranscriptSourceContext';
import { useShallow } from 'zustand/react/shallow';
import { AdvancedViewOptions } from './AdvancedViewOptions';
import { useTranslation } from 'react-i18next';

const DisabledLayerWarning = () => {
  const { t } = useTranslation();

  return (
    <Tooltip
      title={t('transcriptsSettings.disabledLayerWarning')}
      placement="top"
      arrow
      slotProps={{ popper: { sx: sx.warningTooltip } }}
    >
      <WarningIcon sx={sx.warningIcon} />
    </Tooltip>
  );
};

export const TranscriptLayerSection = () => {
  const { t } = useTranslation();
  const { useLayerStore, hasPointOutline } = useTranscriptSource();
  const [isTranscriptLayerOn, isGeneNameFilterActive] = useLayerStore(
    useShallow((store) => [store.isTranscriptLayerOn, store.isGeneNameFilterActive])
  );

  return (
    <Box sx={sx.sectionContainer}>
      <Box>
        <Typography sx={sx.subsectionTitle}>{t('transcriptsSettings.advancedOptions')}</Typography>
        <AdvancedViewOptions />
      </Box>
      <Box>
        <Typography sx={sx.subsectionTitle}>{t('transcriptsSettings.pointSize')}</Typography>
        <PointSizeSlider />
      </Box>
      {hasPointOutline && (
        <Box>
          <Typography sx={sx.subsectionTitle}>{t('transcriptsSettings.pointOutline')}</Typography>
          <PointOutlineToggle />
        </Box>
      )}
      <Box>
        <Box sx={sx.subsectionWrapper}>
          <Typography sx={sx.subsectionTitle}>{t('transcriptsSettings.pointFilters')}</Typography>
          {!isTranscriptLayerOn && isGeneNameFilterActive && <DisabledLayerWarning />}
        </Box>
        <PointFilter />
      </Box>
    </Box>
  );
};

const sx = {
  sectionContainer: {
    overflowX: 'hidden',
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
