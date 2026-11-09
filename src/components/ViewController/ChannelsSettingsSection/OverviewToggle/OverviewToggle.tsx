import { SettingsTooltip as Tooltip } from '../../../../shared/components/SettingsHelp';
import { Box, ToggleButton, Theme, tooltipClasses, useTheme } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { useViewerStore } from '../../../../stores/ViewerStore/ViewerStore';
import { usePolygonDrawingStore } from '../../../../stores/PolygonDrawingStore';
import { useShallow } from 'zustand/react/shallow';
import { getViewportToggleStyles } from '../../../../shared/components/viewportToggle.styles';
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
  const controls = getViewportToggleStyles(useTheme());
  const { t } = useTranslation();
  const [isOverviewOn, toggleOverview] = useViewerStore(
    useShallow((store) => [store.isOverviewOn, store.toggleOverview])
  );
  const isPolygonDrawingEnabled = usePolygonDrawingStore((store) => store.isPolygonDrawingEnabled);

  return (
    <Box sx={sx.wrapper}>
      <ToggleButton
        value="overview"
        selected={isOverviewOn}
        onChange={toggleOverview}
        color="primary"
        sx={controls}
      >
        {t('channelSettings.overview')}
      </ToggleButton>
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
    color: (theme: Theme) => theme.palette.gx.message.warning,
    border: ''
  },
  warningTooltip: {
    [`&.${tooltipClasses.popper}[data-popper-placement*="top"] .${tooltipClasses.tooltip}`]: {
      marginBottom: '0px'
    }
  }
};
