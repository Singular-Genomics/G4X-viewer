import { Box, Typography } from '@mui/material';
import { OverviewToggle } from './OverviewToggle';
import { useViewerStore } from '../../../stores/ViewerStore';
import { LensToggle } from './LensToggle';
import { ChannelControllers } from './ChannelControllers';
import { AddChannel } from './ChannelControllers/AddChannel';
import { ColormapSelector } from './ColormapSelector';
import { useChannelsStore } from '../../../stores/ChannelsStore';
import { useTranslation } from 'react-i18next';
import { InfoTooltip } from '../../InfoTooltip';

export const ChannelsSettingsSection = () => {
  const { t } = useTranslation();
  const loader = useChannelsStore().getLoader();
  const [colormap] = useViewerStore((store) => store.colormap);
  const { shape, labels } = loader[0];

  return (
    <Box>
      <Box>
        <Box sx={sx.titleWithTooltip}>
          <Typography sx={sx.controlsTitle}>{t('channelSettings.colormapSelect')}</Typography>
          <InfoTooltip title={t('tooltips.channelSettings.proteomicsColormap')} />
        </Box>
        <ColormapSelector />
      </Box>
      <Box sx={sx.togglesWrapper}>
        <OverviewToggle />
        {!colormap && shape[labels.indexOf('c')] > 1 && <LensToggle />}
      </Box>
      <Box>
        <Typography sx={sx.controlsTitleStandalone}>{t('channelSettings.channelControls')}</Typography>
        <ChannelControllers />
        <AddChannel />
      </Box>
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
  }
};
