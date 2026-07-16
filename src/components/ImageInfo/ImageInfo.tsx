import { Box, Theme, alpha, useTheme } from '@mui/material';
import { useViewerStore } from '../../stores/ViewerStore';
import { useChannelsStore } from '../../stores/ChannelsStore';
import { ScaleBar } from '../ScaleBar';
import { MobileChannelLegend } from '../MobileChannelLegend';
import { PercentageOfTranscripts } from './PercentageOfTranscripts';
import { HoverInfo } from './HoverInfo/HoverInfo';
import { useShallow } from 'zustand/react/shallow';
import { useZarrDataStore } from '../../stores/ZarrDataStore';

export const ImageInfo = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const pyramidResolution = useViewerStore(useShallow((store) => store.pyramidResolution));
  const hasTranscriptsData = useZarrDataStore((store) => store.hasTranscriptsData);

  const getLoader = useChannelsStore((store) => store.getLoader);
  const loader = getLoader();
  const level = loader[pyramidResolution];

  return (
    <>
      {level && (
        <>
          <Box sx={sx.footerWrapper}>
            <HoverInfo />
            {hasTranscriptsData && <PercentageOfTranscripts />}
          </Box>
          <MobileChannelLegend />
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
    display: 'none',
    gap: '8px',
    backgroundColor: alpha(theme.palette.gx.primary.black, 0.5),
    padding: '8px 14px 10px',
    borderRadius: '10px',
    [theme.breakpoints.up('md')]: {
      display: 'flex'
    }
  }
});
