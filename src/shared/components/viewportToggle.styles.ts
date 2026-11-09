import { Theme, alpha } from '@mui/material';

export const getViewportToggleStyles = (theme: Theme) => ({
  width: '100%',
  minWidth: 0,
  padding: '6px 16px',
  flexShrink: 0,
  whiteSpace: 'nowrap',
  fontSize: '1rem',
  lineHeight: 1.25,
  border: '1px solid',
  borderRadius: '6px',
  borderColor: theme.palette.gx.neutrals[25],
  color: theme.palette.text.secondary,
  backgroundColor: 'transparent',
  boxShadow: 'none',
  '&.Mui-selected': {
    // borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
    backgroundColor: 'transparent'
  },
  '&.Mui-selected:hover': {
    borderColor: alpha(theme.palette.primary.main, 0.5)
    // backgroundColor: alpha(theme.palette.primary.main, 0.2)
  },
  '&:hover': {
    // borderColor: alpha(theme.palette.primary.main, 0.5),
    // backgroundColor: alpha(theme.palette.primary.main, 0.2)
  }
});
