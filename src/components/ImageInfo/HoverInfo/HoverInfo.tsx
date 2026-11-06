import { Theme, Typography, useTheme } from '@mui/material';
import { useViewerStore } from '../../../stores/ViewerStore';
import { useShallow } from 'zustand/react/shallow';

export const HoverInfo = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const hoverCoordinates = useViewerStore(useShallow((store) => store.hoverCoordinates));

  const value = hoverCoordinates.x && hoverCoordinates.y ? `${hoverCoordinates.x}, ${hoverCoordinates.y}` : '--';

  return <Typography sx={sx.footerText}>{value}</Typography>;
};

const styles = (theme: Theme) => ({
  footerText: {
    color: theme.palette.text.primary
  }
});
