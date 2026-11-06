import { Theme } from '@mui/material';

export const getSourceDataActionStyles = (theme: Theme) => ({
  minWidth: 0,
  height: '100%',
  minHeight: '36px',
  padding: '6px 8px',
  borderRadius: '6px',
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.secondary,
  fontSize: '0.75rem',
  fontWeight: 600,
  lineHeight: 1.3,
  whiteSpace: 'nowrap',
  '& .source-data-action-label': {
    minWidth: 0,
    height: '1.3em',
    overflow: 'hidden',
    whiteSpace: 'normal'
  },
  '& .MuiButton-startIcon': {
    flexShrink: 0,
    marginLeft: 0,
    marginRight: '4px'
  },
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
    color: theme.palette.text.primary
  }
});
