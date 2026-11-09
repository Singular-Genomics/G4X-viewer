import { Box, Typography, alpha, useMediaQuery, useTheme, Theme } from '@mui/material';
import { useShallow } from 'zustand/react/shallow';
import { useViewerStore } from '../../stores/ViewerStore/ViewerStore';
import { makeBoundingBox } from './utils';
import { ScaleBarIcon } from './ScaleBarIcon';

export function ScaleBar({ left = 8, bottom = 8 }: { left?: number; bottom?: number }) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const sx = styles(theme, left, bottom);
  const viewState = useViewerStore(useShallow((store) => store.viewState));
  const physicalSize = useViewerStore((store) => store.physicalSize);

  if (!viewState || !physicalSize) return null;

  const boundingBox = makeBoundingBox(viewState);
  const viewLength = boundingBox[2][0] - boundingBox[0][0];
  const barLength = viewLength * 0.05;

  const unit = physicalSize?.unit || 'µm';
  const size = physicalSize?.size || 1;

  const displayNumber = (barLength * size).toPrecision(5);
  const displayUnit = /^micromet(er|re)s?$/i.test(unit) || unit === 'μm' ? 'µm' : unit;

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
        sx={{
          ...sx.text,
          fontSize: isDesktop ? '14px' : '11px'
        }}
      >
        {formattedNumber} {displayUnit}
      </Typography>
    </Box>
  );
}

const styles = (theme: Theme, left: number, bottom: number) => ({
  container: {
    position: 'absolute',
    width: 'max-content',
    left,
    bottom,
    color: theme.palette.viewport.tools.text,
    backgroundColor: alpha(theme.palette.viewport.tools.background, 0.75),
    padding: '2px 6px',
    borderRadius: '3px',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '8px',
    [theme.breakpoints.up('md')]: {
      bottom,
      padding: '4px 8px'
    }
  },
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    justifyContent: 'center'
  },
  text: {
    color: 'inherit',
    textAlign: 'right',
    whiteSpace: 'nowrap'
  }
});
