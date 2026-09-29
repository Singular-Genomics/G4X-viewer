import { alpha, createTheme } from '@mui/material';
import { lightPalette, darkPalette } from './palette';
import { TOOLTIP_ENTER_DELAY } from '../shared/constants';

export const gxTheme = createTheme({
  // MUI defaults to 'media' (OS-only), which makes setMode() a no-op.
  cssVariables: { colorSchemeSelector: 'data-mui-color-scheme' },
  colorSchemes: {
    light: { palette: lightPalette },
    dark: { palette: darkPalette }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
  },
  components: {
    MuiDialog: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiBackdrop-root': {
            backgroundColor: alpha(theme.palette.gx.primary.black, 0.58),
            backdropFilter: 'blur(3px)'
          }
        }),
        paper: ({ theme }) => ({
          borderRadius: '14px',
          border: `1px solid ${alpha(theme.palette.divider, 0.45)}`,
          boxShadow: `0 24px 64px ${alpha(theme.palette.gx.primary.black, 0.32)}`
        })
      }
    },
    MuiTooltip: {
      defaultProps: {
        enterDelay: TOOLTIP_ENTER_DELAY,
        enterNextDelay: TOOLTIP_ENTER_DELAY,
        leaveDelay: 100
      }
    }
  }
});
