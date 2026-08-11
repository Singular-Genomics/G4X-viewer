import { Box, FormControlLabel, Theme, Tooltip, tooltipClasses } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { useViewerStore } from '../../../../stores/ViewerStore/ViewerStore';
import { usePolygonDrawingStore } from '../../../../stores/PolygonDrawingStore';
import { useShallow } from 'zustand/react/shallow';
import { GxCheckbox } from '../../../../shared/components/GxCheckbox';
import { useTranslation } from 'react-i18next';

const OverviewHiddenWarning = () => {
  const { t } = useTranslation();

  return (
    <Tooltip
      title={t('channelSettings.overviewDisabledWhileDrawing')}
      placement="top"
      arrow
      slotProps={{ popper: { sx: sx.warningTooltip } }}
    >
      <WarningIcon sx={sx.warningIcon} />
    </Tooltip>
  );
};

export const OverviewToggle = () => {
  const { t } = useTranslation();
  const [isOverviewOn, toggleOverview] = useViewerStore(
    useShallow((store) => [store.isOverviewOn, store.toggleOverview])
  );
  const isPolygonDrawingEnabled = usePolygonDrawingStore((store) => store.isPolygonDrawingEnabled);

  return (
    <Box sx={sx.wrapper}>
      <FormControlLabel
        label={t('channelSettings.overview')}
        control={
          <GxCheckbox
            onChange={toggleOverview}
            checked={isOverviewOn}
            disableTouchRipple
          />
        }
      />
      {isOverviewOn && isPolygonDrawingEnabled && <OverviewHiddenWarning />}
    </Box>
  );
};

const sx = {
  wrapper: {
    display: 'flex',
    alignItems: 'center'
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
