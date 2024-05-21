import { Theme, createTheme } from '@mui/material';
import { gxColorPalette } from './palette';

  export const gxTheme = createTheme({
    palette: gxColorPalette
  }) as Theme;
