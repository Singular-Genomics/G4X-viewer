import { Box, Theme, Typography, alpha, useTheme } from '@mui/material';
import { useViewerStore } from '../../stores/ViewerStore';
import { useChannelsStore } from '../../stores/ChannelsStore';
import { ScaleBar } from '../ScaleBar';
import { PercentageOfTranscripts } from './PercentageOfTranscripts';
import { HoverInfo } from './HoverInfo/HoverInfo';
import { useShallow } from 'zustand/react/shallow';

export const ImageInfo = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const pyramidResolution = useViewerStore(useShallow((store) => store.pyramidResolution));

  const getLoader = useChannelsStore((store) => store.getLoader);
  const loader = getLoader();
  const level = loader[pyramidResolution];

  return (
    <>
      {level && (
        <>
          <Box sx={sx.footerWrapper}>
            <HoverInfo />
            <Typography sx={sx.footerText}>{`Layer: ${pyramidResolution + 1}/${loader.length}`}</Typography>
            <Typography sx={sx.footerText}>{`Shape: ${level.shape.join(', ')}`}</Typography>
            <PercentageOfTranscripts />
          </Box>
          <ScaleBar />
        </>
      )}
    </>
  );
};

const styles = (theme: Theme) => ({
  footerWrapper: {
    position: 'absolute',
    right: 55,
    bottom: 6,
    display: 'flex',
    gap: '8px',
    backgroundColor: alpha(theme.palette.gx.primary.black, 0.5),
    padding: '8px 14px 10px',
    borderRadius: '10px'
  },
  footerText: {
    color: theme.palette.gx.primary.white
  }
});
