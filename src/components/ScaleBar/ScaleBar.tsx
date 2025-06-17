import { Box, Typography, alpha, useTheme, Theme } from '@mui/material';
import { useShallow } from 'zustand/react/shallow';
import { useViewerStore } from '../../stores/ViewerStore/ViewerStore';
import { useChannelsStore } from '../../stores/ChannelsStore';
import { makeBoundingBox } from './utils';
import { ScaleBarIcon } from './ScaleBarIcon';

export function ScaleBar() {
  const theme = useTheme();
  const sx = styles(theme);
  const viewState = useViewerStore(useShallow((store) => store.viewState));
  const getLoader = useChannelsStore((store) => store.getLoader);

  const loader = getLoader();
  const physicalSize = loader[0]?.meta?.physicalSizes?.x;

  if (!viewState || !physicalSize) return null;

  const boundingBox = makeBoundingBox(viewState);
  const viewLength = boundingBox[2][0] - boundingBox[0][0];
  const barLength = viewLength * 0.05;

  const unit = physicalSize?.unit || 'μm';
  const size = physicalSize?.size || 1;

  const displayNumber = (barLength * size).toPrecision(5);
  const displayUnit = unit;

  const scale = Math.pow(2, viewState.zoom);
  const barWidthInPixels = barLength * scale;

  const numericValue = parseFloat(displayNumber);
  const formattedNumber = numericValue.toFixed(1);

  return (
    <Box sx={sx.container}>
      <Box sx={sx.iconContainer}>
        <ScaleBarIcon width={barWidthInPixels} />
      </Box>
      <Typography
        sx={sx.text}
        fontSize="14px"
      >
        {formattedNumber} {displayUnit}
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
    padding: '4px 8px',
    borderRadius: '10px',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  iconContainer: {
    display: 'flex',
    justifyContent: 'center'
  },
  text: {
    color: theme.palette.gx.primary.white
  }
});
