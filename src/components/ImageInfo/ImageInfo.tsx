import { Box, Theme, Typography, alpha, useTheme } from '@mui/material';
import { useViewerStore } from '../../stores/ViewerStore';
import { useShallow } from 'zustand/react/shallow';
import { useChannelsStore } from '../../stores/ChannelsStore';
// import { useTranscriptLayerStore } from '../../stores/TranscriptLayerStore';
// import { useBinaryFilesStore } from '../../stores/BinaryFilesStore';
import { ScaleBar } from '../ScaleBar';

export const ImageInfo = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const [pyramidResolution, hoverCoordinates] = useViewerStore(
    useShallow((store) => [store.pyramidResolution, store.hoverCoordinates])
  );
  // const [maxVisibleLayers, overrideLayers] = useTranscriptLayerStore(
  //   useShallow((store) => [store.maxVisibleLayers, store.overrideLayers])
  // );
  // const [transcriptFiles, layerConfig] = useBinaryFilesStore(useShallow((store) => [store.files, store.layerConfig]));

  const getLoader = useChannelsStore((store) => store.getLoader);
  const loader = getLoader();
  const level = loader[pyramidResolution];

  // const hasTranscriptFiles = transcriptFiles.length > 0;
  // const currentZoom = viewState?.zoom || 0;

  return (
    <>
      {level && (
        <>
          <Box sx={sx.footerWrapper}>
            <Typography sx={sx.footerText}>
              {`Mouse Pos: [${hoverCoordinates.x || '--'}, ${hoverCoordinates.y || '--'}]`}
            </Typography>
            <Typography sx={sx.footerText}>{`Layer: ${pyramidResolution + 1}/${loader.length}`}</Typography>
            <Typography sx={sx.footerText}>{`Shape: ${level.shape.join(', ')}`}</Typography>
            <Typography sx={sx.footerText}>{`Transcripts: `}</Typography>
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
