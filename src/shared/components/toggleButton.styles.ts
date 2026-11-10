import { Theme, lighten, darken, alpha } from '@mui/material';

export const getToggleButtonStyles = (theme: Theme) => ({
  width: '100%',
  height: '36px',
  minWidth: 0,
  padding: '6px 16px',
  flexShrink: 0,
  whiteSpace: 'nowrap',
  fontSize: '1rem',
  lineHeight: 1.25,
  // border: '0px solid',
  borderRadius: '6px',
  borderColor: 'transparent',
  color: theme.palette.text.secondary,
  backgroundColor: theme.palette.background.level1,
  boxShadow: 'none',
  '&.Mui-disabled': {
    borderColor: 'transparent'
  },
  '&.Mui-selected': {
    color: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.2)
  },
  '&.Mui-selected:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.3)
  },
  '&:hover': {
    backgroundColor:
      theme.palette.mode === 'dark'
        ? lighten(theme.palette.background.level1, 0.05)
        : darken(theme.palette.background.level1, 0.05)
  }
});
