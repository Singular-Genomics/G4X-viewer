import { createTheme } from '@mui/material';
import { lightPalette, darkPalette } from './palette';

export const gxTheme = createTheme({
  // MUI defaults to 'media' (OS-only), which makes setMode() a no-op.
  cssVariables: { colorSchemeSelector: 'data-mui-color-scheme' },
  colorSchemes: {
    light: { palette: lightPalette },
    dark: { palette: darkPalette }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
  }
});
