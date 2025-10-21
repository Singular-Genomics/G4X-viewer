import { alpha, Box, ClickAwayListener, IconButton, Popover, SxProps, Theme, Tooltip, useTheme } from '@mui/material';
import { PointFilterColorPickerCellProps } from './PointFilterColorPickerCell.types';
import { useRef, useState } from 'react';
import LensIcon from '@mui/icons-material/Lens';
import { useBinaryFilesStore } from '../../../../../stores/BinaryFilesStore';
import { GxColorPicker } from '../../../../../shared/components/GxColorPicker/GxColorPicker';
import { ColorHsv } from '../../../../../shared/components/GxColorPicker/GxColorPicker.types';
import { HsvToRgb, RgbToHsv } from '../../../../../shared/components/GxColorPicker/GxColorPicker.helpers';
import { useTranslation } from 'react-i18next';

export const PointFilterColorPickerCell = ({ row }: PointFilterColorPickerCellProps) => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef(null);
  const { setColormapConfig, colorMapConfig } = useBinaryFilesStore();
  const [color, setColor] = useState<ColorHsv>(RgbToHsv({ r: row.color[0], g: row.color[1], b: row.color[2] }));

  const handleConfirm = () => {
    const newColorRgb = HsvToRgb(color);
    const updatedConfig = colorMapConfig.map((entry) =>
      entry.gene_name === row.gene_name ? { ...entry, color: [newColorRgb.r, newColorRgb.g, newColorRgb.b] } : entry
    );
    setColormapConfig(updatedConfig);
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
          sx={sx.geneColorButton}
        >
          <LensIcon style={{ color: `rgb(${row.color})` }} />
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
  geneColorButton: {
    padding: '4px'
  },
  paper: {
    backgroundColor: alpha(theme.palette.gx.primary.black, 0.75),
    padding: '8px',
    width: '240px'
  }
});
