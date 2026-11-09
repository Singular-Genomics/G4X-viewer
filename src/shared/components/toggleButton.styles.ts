import { Theme, alpha } from '@mui/material';

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
  backgroundColor: theme.palette.gx.neutrals[15],
  boxShadow: 'none',
  '&.Mui-disabled': {
    borderColor: 'transparent'
  },
  '&.Mui-selected': {
    // borderColor: theme.palette.primary.main,
    color: theme.palette.primary.main,
    backgroundColor: alpha(theme.palette.primary.main, 0.2)
  },
  '&.Mui-selected:hover': {
    // borderColor: alpha(theme.palette.primary.main, 0.5),
    backgroundColor: alpha(theme.palette.primary.main, 0.1)
  },
  '&:hover': {
    // borderColor: alpha(theme.palette.primary.main, 0.5),
    backgroundColor: alpha(theme.palette.gx.neutrals[20], 0.75)
  }
});
