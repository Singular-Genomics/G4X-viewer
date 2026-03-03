import { Box, Typography, alpha, useTheme, useMediaQuery, Theme } from '@mui/material';
import { useShallow } from 'zustand/react/shallow';
import { useChannelsStore } from '../../stores/ChannelsStore';
import { useViewerStore } from '../../stores/ViewerStore/ViewerStore';

export function MobileChannelLegend() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const sx = styles(theme);

  const [ids, selections, colors, channelsVisible] = useChannelsStore(
    useShallow((store) => [store.ids, store.selections, store.colors, store.channelsVisible])
  );
  const channelOptions = useViewerStore((store) => store.channelOptions);

  if (isDesktop || !ids.length) return null;

  const visibleChannels = ids
    .map((id, index) => {
      if (!channelsVisible[index]) return null;
      const name = channelOptions[(selections as any)[index]?.c];
      const color = colors[index];
      if (!name || !color) return null;
      return { id, name, color };
    })
    .filter(Boolean);

  if (!visibleChannels.length) return null;

  return (
    <Box sx={sx.container}>
      {visibleChannels.map((channel) => {
        const cssColor = `rgb(${channel!.color[0]}, ${channel!.color[1]}, ${channel!.color[2]})`;
        return (
          <Typography
            key={channel!.id}
            sx={{ ...sx.channelName, color: cssColor }}
          >
            {channel!.name}
          </Typography>
        );
      })}
    </Box>
  );
}

const styles = (theme: Theme) => ({
  container: {
    position: 'absolute',
    right: 8,
    bottom: 56,
    backgroundColor: alpha(theme.palette.gx.primary.black, 0.5),
    padding: '4px 8px',
    borderRadius: '10px',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  channelName: {
    fontSize: '11px',
    fontWeight: 600,
    lineHeight: 1.2
  }
});
