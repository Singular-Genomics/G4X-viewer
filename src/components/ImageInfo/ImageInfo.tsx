import { Box, Theme, alpha, useTheme } from '@mui/material';
import { useChannelsStore } from '../../stores/ChannelsStore';
import { ScaleBar } from '../ScaleBar';
import { MobileChannelLegend } from '../MobileChannelLegend';
import { PercentageOfTranscripts } from './PercentageOfTranscripts';
import { HoverInfo } from './HoverInfo/HoverInfo';
import { useZarrDataStore } from '../../stores/ZarrDataStore';
import { useTranscriptLayerStore } from '../../stores/TranscriptLayerStore';

export const ImageInfo = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const hasTranscriptsData = useZarrDataStore((store) => store.hasTranscriptsData);
  const isTranscriptLayerOn = useTranscriptLayerStore((store) => store.isTranscriptLayerOn);

  const getLoader = useChannelsStore((store) => store.getLoader);
  const loader = getLoader();
  const hasImage = Boolean(loader[0]);

  return (
    <>
      {hasImage && (
        <>
          <Box sx={sx.footerWrapper}>
            <HoverInfo />
            {hasTranscriptsData && isTranscriptLayerOn && <PercentageOfTranscripts />}
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
