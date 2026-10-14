import { createTheme } from '@mui/material';
import { gxColorPalette } from './palette';

export const gxTheme = createTheme({
  palette: gxColorPalette,
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
  }
});
