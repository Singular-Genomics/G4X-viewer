import { Box, IconButton } from "@mui/material";
import LensIcon from '@mui/icons-material/Lens';
import { COLOR_PALLETE } from "../../../../../shared/constants";
import { ColorPaletteProps } from "./ColorPalette.types";

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
    width: '70px',
    height: '40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  button: {
    padding: '3px',
    width: '16px',
    height: '16px'
  },
  icon: {
    width: '17px',
    height: '17px'
  }
};
