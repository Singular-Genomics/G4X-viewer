import { Box, Theme, Typography, alpha, useTheme } from '@mui/material';
import { useViewerStore } from '../../stores/ViewerStore';
import { useChannelsStore } from '../../stores/ChannelsStore';
import { ScaleBar } from '../ScaleBar';
import { PercentageOfTranscripts } from './PercentageOfTranscripts';
import { HoverInfo } from './HoverInfo/HoverInfo';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';

export const ImageInfo = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();
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
            <Typography
              sx={sx.footerText}
            >{`${t('general.layers')}: ${pyramidResolution + 1}/${loader.length}`}</Typography>
            <Typography sx={sx.footerText}>{`${t('general.shape')}: ${level.shape.join(', ')}`}</Typography>
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
    right: 8,
    bottom: 8,
    display: 'none',
    gap: '6px',
    backgroundColor: alpha(theme.palette.gx.primary.black, 0.5),
    padding: '4px 8px 6px',
    borderRadius: '10px',
    [theme.breakpoints.up('md')]: {
      display: 'flex',
      right: 55,
      bottom: 6,
      gap: '8px',
      padding: '8px 14px 10px'
    }
  },
  footerText: {
    color: theme.palette.gx.primary.white,
    fontSize: '12px',
    lineHeight: '14px',
    [theme.breakpoints.up('md')]: {
      fontSize: '14px',
      lineHeight: '16px'
    }
  }
});
