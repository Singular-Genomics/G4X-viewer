import { alpha, Theme } from '@mui/material';

export const getViewportToolButtonStyles = (theme: Theme, active = false) => ({
  color: theme.palette.viewport.tools.text,
  backgroundColor: alpha(
    active ? theme.palette.viewport.tools.activeBackground : theme.palette.viewport.tools.background,
    active ? 1 : 0.75
  ),
  transition: 'color 100ms ease-in-out',
  '&:hover': {
    backgroundColor: alpha(theme.palette.viewport.tools.background, active ? 0.5 : 0.5)
  },
  '&.Mui-disabled': {
    color: alpha(theme.palette.viewport.tools.text, 0.5),
    backgroundColor: alpha(theme.palette.viewport.tools.background, 0.15),
    cursor: 'default'
  }
});
