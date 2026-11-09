import { SettingsTooltip } from '../../../shared/components/SettingsHelp';
import { getViewportToggleStyles } from '../../../shared/components/viewportToggle.styles';
import { useViewerStore } from '../../../stores/ViewerStore';
import { Box, ToggleButton, Typography } from '@mui/material';
import { GlobalSelectionSliders } from './GlobalSelectionSliders';
import { ImageDetails } from './ImageDetails';
import { PolygonLayerToggle } from './PolygonLayerToggle';
import { usePolygonDrawingStore } from '../../../stores/PolygonDrawingStore';
import { useTranslation } from 'react-i18next';
import { OverviewToggle } from '../ChannelsSettingsSection/OverviewToggle';

export const ViewControlsSection = () => {
  const { t } = useTranslation();
  const areToolsVisible = useViewerStore((store) => store.areToolsVisible);
  const isStatusVisible = useViewerStore((store) => store.isStatusVisible);
  const handleToggleTools = () => {
    if (areToolsVisible && usePolygonDrawingStore.getState().isPolygonDrawingEnabled) {
      usePolygonDrawingStore.getState().togglePolygonDrawing();
    }
    useViewerStore.setState({ areToolsVisible: !areToolsVisible });
  };
  const polygonFeatures = usePolygonDrawingStore((store) => store.polygonFeatures);
  return (
    <Box sx={sx.sectionContainer}>
      <ImageDetails />
      <GlobalSelectionSliders />
      {!!polygonFeatures.length && (
        <Box>
          <Typography sx={sx.subsectionTitle}>{t('viewSettings.layerToggles')}</Typography>
          <Box sx={sx.togglesSubSection}>
            <PolygonLayerToggle />
          </Box>
        </Box>
      )}
      <Box sx={sx.viewportItemsSection}>
        <Typography sx={sx.subsectionTitle}>{t('viewSettings.viewportItems')}</Typography>
        <Box sx={sx.viewportToggles}>
          <SettingsTooltip
            title={t('settingsHelp.controls.overview')}
            helpTitle={t('channelSettings.overview')}
          >
            <OverviewToggle />
          </SettingsTooltip>
          <SettingsTooltip
            title={t('settingsHelp.controls.tools')}
            helpTitle={t('viewSettings.tools')}
          >
            <ToggleButton
              value="tools"
              selected={areToolsVisible}
              onChange={handleToggleTools}
              color="primary"
              sx={(theme) => getViewportToggleStyles(theme)}
            >
              {t('viewSettings.tools')}
            </ToggleButton>
          </SettingsTooltip>
          <SettingsTooltip
            title={t('settingsHelp.controls.status')}
            helpTitle={t('viewSettings.status')}
          >
            <ToggleButton
              value="status"
              selected={isStatusVisible}
              onChange={() => useViewerStore.setState({ isStatusVisible: !isStatusVisible })}
              color="primary"
              sx={(theme) => getViewportToggleStyles(theme)}
            >
              {t('viewSettings.status')}
            </ToggleButton>
          </SettingsTooltip>
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
  viewportItemsSection: {
    marginTop: '16px'
  },
  viewportToggles: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    alignItems: 'center',
    gap: '8px',
    paddingInline: '8px',
    '& .MuiToggleButton-root': {
      width: '100%',
      minWidth: 0
    }
  },
  togglesSubSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingLeft: '8px'
  }
};
