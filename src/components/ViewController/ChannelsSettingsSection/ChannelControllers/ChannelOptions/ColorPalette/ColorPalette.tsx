import { Box, IconButton } from '@mui/material';
import LensIcon from '@mui/icons-material/Lens';
import { ColorPaletteProps } from './ColorPalette.types';
import { COLOR_PALLETE } from '../../../../../../shared/constants';

export const ColorPalette = ({ handleColorSelect }: ColorPaletteProps) => (
  <Box sx={sx.container}>
    {COLOR_PALLETE.map((color, index) => (
      <IconButton
        key={index}
        sx={sx.button}
        onClick={() => handleColorSelect(color)}
      >
        <LensIcon
          sx={sx.icon}
          fontSize="small"
          style={{ color: `rgb(${color})` }}
        />
      </IconButton>
    ))}
  </Box>
);

const sx = {
  container: {
    width: '120px',
    height: '36px',
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'flex-start'
  },
  button: {
    padding: '4px',
    width: '28px',
    height: '28px',
    flex: '0 0 25%'
  },
  icon: {
    width: '24px',
    height: '24px'
  }
};
