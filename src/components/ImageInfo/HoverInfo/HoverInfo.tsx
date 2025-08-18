import { Theme, Typography, useTheme } from '@mui/material';
import { useViewerStore } from '../../../stores/ViewerStore';
import { useShallow } from 'zustand/react/shallow';

export const HoverInfo = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const hoverCoordinates = useViewerStore(useShallow((store) => store.hoverCoordinates));

  return (
    <Typography sx={sx.footerText}>
      {`Mouse Pos: [${hoverCoordinates.x || '--'}, ${hoverCoordinates.y || '--'}]`}
    </Typography>
  );
};

const styles = (theme: Theme) => ({
  footerText: {
    color: theme.palette.gx.primary.white
  }
});
