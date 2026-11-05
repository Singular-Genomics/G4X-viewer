import { Theme } from '@mui/material';

export const getControlButtonStyles = (theme: Theme) => ({
  border: '1px solid',
  borderColor: theme.palette.gx.mediumGrey[100],
  backgroundColor: theme.palette.gx.primary.white,
  color: theme.palette.gx.darkGrey[300],
  fontWeight: 600,
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.18)',
  '&:hover': {
    borderColor: theme.palette.primary.dark,
    backgroundColor: theme.palette.gx.lightGrey[900]
  },
  '&.Mui-selected': {
    borderColor: theme.palette.primary.dark,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark
    }
  },
  '&.Mui-disabled': {
    borderColor: theme.palette.gx.mediumGrey[500],
    backgroundColor: theme.palette.gx.lightGrey[900],
    color: theme.palette.gx.darkGrey[900],
    boxShadow: 'none'
  },
  '&.Mui-selected.Mui-disabled': {
    borderColor: theme.palette.primary.dark,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText
  },
  '&.Mui-focusVisible': {
    outline: `2px solid ${theme.palette.primary.dark}`,
    outlineOffset: '2px'
  }
});
