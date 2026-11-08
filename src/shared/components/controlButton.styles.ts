import { Theme } from '@mui/material';

export const getControlButtonStyles = (theme: Theme) => ({
  border: '0px solid',
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  width: 114,
  padding: '2px 4px',
  fontSize: '1rem',
  fontWeight: 700,
  flexShrink: 0,
  boxShadow: theme.shadows[1],
  // '&:hover': {
  //   backgroundColor: theme.palette.action.hover
  // },
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.text.primary,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark
    }
    // },
    // '&.Mui-disabled': {
    //   backgroundColor: theme.palette.action.disabledBackground,
    //   color: theme.palette.action.disabled,
    //   boxShadow: 'none'
    // },
    // '&.Mui-selected.Mui-disabled': {
    //   backgroundColor: theme.palette.primary.main,
    //   color: theme.palette.primary.contrastText
    // },
    // '&.Mui-focusVisible': {
    //   outline: `2px solid ${theme.palette.primary.dark}`,
    //   outlineOffset: '2px'
  }
});
