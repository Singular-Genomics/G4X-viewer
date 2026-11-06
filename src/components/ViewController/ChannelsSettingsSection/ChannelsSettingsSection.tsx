import { Box, Typography } from '@mui/material';
import { useViewerStore } from '../../../stores/ViewerStore';
import { LensToggle } from './LensToggle';
import { ChannelControllers } from './ChannelControllers';
import { AddChannel } from './ChannelControllers/AddChannel';
import { ColormapSelector } from './ColormapSelector';
import { useChannelsStore } from '../../../stores/ChannelsStore';
import { useTranslation } from 'react-i18next';
import { InfoTooltip } from '../../InfoTooltip';
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
            <Typography sx={sx.controlsTitleStandalone}>{t('channelSettings.channelControls')}</Typography>
            <ChannelControllers />
            <AddChannel />
            <ChannelSettingsImportExportButtons />
          </Box>
          <GxCollapsibleSection
            sectionTitle={t('channelSettings.advanced')}
            unmountOnExit={false}
            customStyles={{ sectionContainer: sx.advancedSection }}
          >
            <Box>
              <Box sx={sx.titleWithTooltip}>
                <Typography sx={sx.controlsTitle}>{t('channelSettings.colormapSelect')}</Typography>
                <InfoTooltip title={t('tooltips.channelSettings.proteomicsColormap')} />
              </Box>
              <ColormapSelector />
            </Box>
            {!colormap && shape[labels.indexOf('c')] > 1 && (
              <Box sx={sx.togglesWrapper}>
                <LensToggle />
              </Box>
            )}
          </GxCollapsibleSection>
        </>
      )}
    </Box>
  );
};

const sx = {
  togglesWrapper: {
    padding: '8px'
  },
  controlsTitle: {
    fontWeight: 700
  },
  controlsTitleStandalone: {
    fontWeight: 700,
    paddingLeft: '8px',
    marginBottom: '8px'
  },
  titleWithTooltip: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: '8px',
    marginBottom: '8px'
  },
  advancedSection: {
    marginTop: '12px'
  }
};
