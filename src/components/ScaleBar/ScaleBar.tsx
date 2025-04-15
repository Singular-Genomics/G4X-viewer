import { Box, Typography, alpha, useTheme, Theme } from '@mui/material';
import { useShallow } from 'zustand/react/shallow';
import { useViewerStore } from '../../stores/ViewerStore/ViewerStore';
import { useChannelsStore } from '../../stores/ChannelsStore';
import scaleBarIcon from '../../assets/img/scaleBarIcon.svg';

export function ScaleBar() {
  const theme = useTheme();
  const sx = styles(theme);
  const viewState = useViewerStore(useShallow((store) => store.viewState));
  const getLoader = useChannelsStore((store) => store.getLoader);

  const loader = getLoader();
  const physicalSize = loader[0]?.meta?.physicalSizes?.x;

  // Calculation logic for scalebar
  const { zoom, width } = viewState || { zoom: 0, width: 0 };
  const scale = Math.pow(2, zoom);
  const viewLength = width / scale;
  const barLength = viewLength * 0.05;
  const displayNumber = Math.round(barLength * (physicalSize?.size || 1));

  return (
    <Box sx={sx.container}>
      <Box sx={sx.iconContainer}>
        <img
          src={scaleBarIcon}
          alt="scale bar"
        />
      </Box>
      <Typography sx={sx.text}>
        {displayNumber} {physicalSize?.unit || 'µm'}
      </Typography>
    </Box>
  );
}

const styles = (theme: Theme) => ({
  container: {
    position: 'absolute',
    right: 55,
    bottom: 50,
    backgroundColor: alpha(theme.palette.gx.primary.black, 0.5),
    padding: '8px 14px',
    borderRadius: '10px',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  iconContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '2px'
  },
  text: {
    color: theme.palette.gx.primary.white
  }
});
