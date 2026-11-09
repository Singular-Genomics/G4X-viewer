import { SettingsTooltip as Tooltip } from '../../../shared/components/SettingsHelp';
import { Box, SvgIcon, Typography } from '@mui/material';
import { useViewerStore } from '../../../stores/ViewerStore';
import { LensToggle } from './LensToggle';
import { ChannelControllers } from './ChannelControllers';
import { AddChannel } from './ChannelControllers/AddChannel';
import { ColormapSelector } from './ColormapSelector';
import { useChannelsStore } from '../../../stores/ChannelsStore';
import { useTranslation } from 'react-i18next';
import { ChannelSettingsImportExportButtons } from './ChannelControllers/ChannelSettingsImportExportButtons';
import { GxCollapsibleSection } from '../../../shared/components/GxCollapsibleSection';
import { BrightfieldImagesSection } from '../BrightfieldImagesSection';

export const ChannelsSettingsSection = ({ isRgb = false }: { isRgb?: boolean }) => {
  const { t } = useTranslation();
  const loader = useChannelsStore().getLoader();
  const [colormap] = useViewerStore((store) => store.colormap);
  const { shape, labels } = loader[0];

  return (
    <Box>
      <BrightfieldImagesSection />
      {!isRgb && (
        <>
          <Box>
            <Box sx={sx.controlsHeader}>
              <Typography sx={sx.controlsTitleStandalone}>{t('channelSettings.channelControls')}</Typography>
              <AddChannel />
            </Box>
            <ChannelControllers />
          </Box>
          <GxCollapsibleSection
            sectionTitle={t('channelSettings.advanced')}
            sectionIcon={
              <SvgIcon
                fontSize="small"
                viewBox="0 -960 960 960"
              >
                <path d="M440-120v-240h80v80h320v80H520v80h-80Zm-320-80v-80h240v80H120Zm160-160v-80H120v-80h160v-80h80v240h-80Zm160-80v-80h400v80H440Zm160-160v-240h80v80h160v80H680v80h-80Zm-480-80v-80h400v80H120Z" />
              </SvgIcon>
            }
            unmountOnExit={false}
            customStyles={{ sectionContainer: sx.advancedSection, contentContainer: sx.advancedContent }}
          >
            {!colormap && shape[labels.indexOf('c')] > 1 && <LensToggle />}
            <Box sx={sx.colorModeRow}>
              <Tooltip
                title={t('tooltips.channelSettings.proteomicsColormap')}
                arrow
              >
                <Typography sx={sx.controlsTitle}>{t('channelSettings.colormapSelect')}</Typography>
              </Tooltip>
              <Tooltip
                title={t('tooltips.channelSettings.proteomicsColormap')}
                helpTitle={t('channelSettings.colormapSelect')}
              >
                <Box sx={sx.colorModeSelector}>
                  <ColormapSelector />
                </Box>
              </Tooltip>
            </Box>
            <Box sx={sx.colorModeRow}>
              <Typography sx={sx.controlsTitle}>{t('channelSettings.configuration')}</Typography>
              <Box sx={sx.colorModeSelector}>
                <ChannelSettingsImportExportButtons />
              </Box>
            </Box>
          </GxCollapsibleSection>
        </>
      )}
    </Box>
  );
};

const sx = {
  controlsTitle: {
    fontWeight: 700,
    flexShrink: 0,
    whiteSpace: 'nowrap'
  },
  controlsTitleStandalone: {
    fontSize: '1.2rem',
    fontWeight: 700,
    paddingLeft: '8px'
  },
  controlsHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '8px'
  },
  colorModeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingLeft: '8px',
    marginBottom: '8px'
  },
  colorModeSelector: {
    flex: 1,
    minWidth: 0,
    maxWidth: '200px',
    marginLeft: 'auto'
  },
  advancedSection: {
    marginLeft: '20px',
    marginTop: '12px'
  },
  advancedContent: {
    '&::after': {
      display: 'none'
    }
  }
};
