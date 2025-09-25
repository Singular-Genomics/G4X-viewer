import { Theme, ClickAwayListener, IconButton, MenuList, Paper, Popper, Tooltip, alpha, useTheme } from '@mui/material';
import LensIcon from '@mui/icons-material/Lens';
import { useState, useRef } from 'react';
import { useBinaryFilesStore } from '../../../../../stores/BinaryFilesStore';
import { type ColorPickerCellProps } from './PointFiltersTable.types';
import { ColorPalette } from '../../../ChannelsSettingsSection/ChannelControllers/ChannelOptions/ColorPalette';

export const ColorPickerCell = ({ row }: ColorPickerCellProps) => {
  const theme = useTheme();
  const sx = styles(theme);
  const [isOpen, setIsOpen] = useState(false);
  const anchorRef = useRef(null);
  const setColormapConfig = useBinaryFilesStore((store) => store.setColormapConfig);
  const colorMapConfig = useBinaryFilesStore((store) => store.colorMapConfig);

  const handleColorSelect = (newColor: number[]) => {
    const updatedConfig = colorMapConfig.map((entry) =>
      entry.gene_name === row.gene_name ? { ...entry, color: newColor } : entry
    );
    setColormapConfig(updatedConfig);
    setIsOpen(false);
  };

  return (
    <>
      <Tooltip title="Click to change">
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
      <Popper
        open={isOpen}
        anchorEl={anchorRef.current}
        placement="bottom-start"
      >
        <Paper sx={sx.paper}>
          <ClickAwayListener onClickAway={() => setIsOpen(false)}>
            <MenuList>
              <ColorPalette handleColorSelect={handleColorSelect} />
            </MenuList>
          </ClickAwayListener>
        </Paper>
      </Popper>
    </>
  );
};

const styles = (theme: Theme) => ({
  geneColorButton: {
    padding: '4px'
  },
  paper: {
    backgroundColor: alpha(theme.palette.gx.primary.black, 0.75),
    padding: '8px'
  }
});
