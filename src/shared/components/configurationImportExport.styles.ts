import { SxProps, Theme, alpha } from '@mui/material';

export const getConfigurationImportExportStyles = (theme: Theme): Record<string, SxProps> => ({
  buttonsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '8px',
    width: '100%'
  },
  button: {
    height: '36px',
    minWidth: 0,
    padding: '4px 6px',
    fontSize: '0.75rem',
    whiteSpace: 'nowrap',
    color: theme.palette.settingsPanel.text,

    backgroundColor: alpha(theme.palette.primary.main, 0.25),
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.08)
    },
    '& .MuiButton-startIcon': {
      marginLeft: 0,
      marginRight: '4px',
      '& > *': { fontSize: '16px' }
    }
  },
  importButtonActive: {
    backgroundColor: alpha(theme.palette.primary.main, 0.12)
  },
  importButtonAccept: {
    color: theme.palette.success.main,
    backgroundColor: alpha(theme.palette.success.main, 0.12)
  },
  importButtonReject: {
    color: theme.palette.error.main,
    backgroundColor: alpha(theme.palette.error.main, 0.12)
  }
});
