import { Theme } from '@mui/material';

export const getControlButtonStyles = (theme: Theme) => ({
  border: '1px solid',
  borderColor: theme.palette.divider,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  fontWeight: 600,
  boxShadow: theme.shadows[1],
  '&:hover': {
    borderColor: theme.palette.primary.dark,
    backgroundColor: theme.palette.action.hover
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
    borderColor: theme.palette.divider,
    backgroundColor: theme.palette.action.disabledBackground,
    color: theme.palette.action.disabled,
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
