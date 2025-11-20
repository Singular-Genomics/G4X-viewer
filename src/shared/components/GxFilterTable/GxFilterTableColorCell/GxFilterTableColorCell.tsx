import { alpha, Box, ClickAwayListener, IconButton, Popover, SxProps, Theme, Tooltip, useTheme } from '@mui/material';
import { GxFilterTableColorCellProps } from './GxFilterTableColorCell.types';
import { useRef, useState } from 'react';
import LensIcon from '@mui/icons-material/Lens';
import { GxColorPicker } from '../../GxColorPicker/GxColorPicker';
import { ColorHsv } from '../../GxColorPicker/GxColorPicker.types';
import { HsvToRgb, RgbToHsv } from '../../GxColorPicker/GxColorPicker.helpers';
import { useTranslation } from 'react-i18next';

export const GxFilterTableColorCell = ({
  currentColor,
  currnetValueName,
  handleColorUpdate
}: GxFilterTableColorCellProps) => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef(null);
  const [color, setColor] = useState<ColorHsv>(
    RgbToHsv({ r: currentColor[0], g: currentColor[1], b: currentColor[2] })
  );

  const handleConfirm = () => {
    const newColorRgb = HsvToRgb(color);
    handleColorUpdate([newColorRgb.r, newColorRgb.g, newColorRgb.b], currnetValueName);
    setIsOpen(false);
  };

  return (
    <>
      <Tooltip title={t('transcriptsSettings.clickToChange')}>
        <IconButton
          ref={anchorRef}
          onClick={(event) => {
            event.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          sx={sx.colorButton}
        >
          <LensIcon style={{ color: `rgb(${currentColor})` }} />
        </IconButton>
      </Tooltip>
      <Popover
        open={isOpen}
        anchorEl={anchorRef.current}
        onClose={() => setIsOpen(false)}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'left'
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'right'
        }}
      >
        <Box sx={sx.paper}>
          <ClickAwayListener onClickAway={() => setIsOpen(false)}>
            <GxColorPicker
              color={color}
              handleColorChange={setColor}
              handleConfirm={handleConfirm}
            />
          </ClickAwayListener>
        </Box>
      </Popover>
    </>
  );
};

const styles = (theme: Theme): Record<string, SxProps> => ({
  colorButton: {
    padding: '4px'
  },
  paper: {
    backgroundColor: alpha(theme.palette.gx.primary.black, 0.75),
    padding: '8px',
    width: '240px'
  }
});
