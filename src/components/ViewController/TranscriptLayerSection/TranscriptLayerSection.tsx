import { SettingsTooltip as Tooltip } from '../../../shared/components/SettingsHelp';
import { Box, Theme, Typography, tooltipClasses } from '@mui/material';
import { PointSizeSlider } from './PointSizeSlider';
import { PointFilter } from './PointsFilter/PointFilter';
import WarningIcon from '@mui/icons-material/Warning';
import { useTranscriptLayerStore } from '../../../stores/TranscriptLayerStore';
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
  const [isTranscriptLayerOn, isGeneNameFilterActive] = useTranscriptLayerStore(
    useShallow((store) => [store.isTranscriptLayerOn, store.isGeneNameFilterActive])
  );

  return (
    <Box
      component="fieldset"
      disabled={!isTranscriptLayerOn}
      inert={!isTranscriptLayerOn}
      aria-disabled={!isTranscriptLayerOn}
      sx={sx.sectionContainer}
    >
      <Box>
        <AdvancedViewOptions />
      </Box>
      <PointSizeSlider />
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
  },
  warningIcon: {
    color: (theme: Theme) => theme.palette.gx.message.warning,
    border: ''
  },
  warningTooltip: {
    [`&.${tooltipClasses.popper}[data-popper-placement*="top"] .${tooltipClasses.tooltip}`]: {
      marginBottom: '0px'
    }
  }
};
