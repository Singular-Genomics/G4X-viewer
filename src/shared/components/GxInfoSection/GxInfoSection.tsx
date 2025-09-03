import { Box, SxProps } from '@mui/material';
import { GxInfoBox } from '../GxInfoBox/GxInfoBox';
import { GxInfoSectionProps } from './GxInfoSection.types';

export const GxInfoSection = ({ infoBoxes, position }: GxInfoSectionProps) => {
  return (
    <Box
      sx={
        {
          ...sx.container,
          ...(position && {
            position: 'fixed',
            top: position.top,
            right: position.right,
            bottom: position.bottom,
            left: position.left
          })
        } as SxProps
      }
    >
      {infoBoxes.map((infoBox, index) => (
        <GxInfoBox
          key={index}
          {...infoBox}
        />
      ))}
    </Box>
  );
};

const sx = {
  container: {
    width: 'auto',
    minWidth: 'fit-content',
    maxWidth: 400,
    display: 'flex',
    flexDirection: 'column',
    gap: 1,
    zIndex: 2
  }
};
