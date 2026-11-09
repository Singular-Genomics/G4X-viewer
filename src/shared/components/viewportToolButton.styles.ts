import { alpha, Theme } from '@mui/material';

export const getViewportToolButtonStyles = (theme: Theme, active = false) => ({
  color: theme.palette.gx.neutrals[65],
  backgroundColor: alpha(
    active ? theme.palette.primary.dark : theme.palette.background.viewportTools,
    active ? 1 : 0.75
  ),
  transition: 'color 100ms ease-in-out',
  '&:hover': {
    backgroundColor: alpha(theme.palette.background.viewportTools, active ? 0.5 : 0.5)
  },
  '&.Mui-disabled': {
    color: alpha(theme.palette.gx.neutrals[65], 0.5),
    backgroundColor: alpha(theme.palette.background.viewportTools, 0.15),
    cursor: 'default'
  }
});
