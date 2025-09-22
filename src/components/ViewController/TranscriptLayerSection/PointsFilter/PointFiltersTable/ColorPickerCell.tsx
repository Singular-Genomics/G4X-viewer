import { ClickAwayListener, IconButton, MenuList, Paper, Popper, Tooltip } from '@mui/material';
import LensIcon from '@mui/icons-material/Lens';
import { useState, useRef } from 'react';
import { useBinaryFilesStore } from '../../../../../stores/BinaryFilesStore';
import { COLOR_PALLETE } from '../../../../../shared/constants';
import { PointFiltersTableRowEntry } from './PointFiltersTable.types';

export const ColorPickerCell = ({ row }: { row: PointFiltersTableRowEntry }) => {
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
      <Tooltip title={`RGB: ${row.color.join(' ')} - Click to change`}>
        <IconButton
          ref={anchorRef}
          onClick={(event) => {
            event.stopPropagation();
            setIsOpen((prev) => !prev);
          }}
          sx={{ padding: '4px' }}
        >
          <LensIcon style={{ color: `rgb(${row.color})` }} />
        </IconButton>
      </Tooltip>
      <Popper
        open={isOpen}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        style={{ zIndex: 1300 }}
      >
        <Paper sx={{ backgroundColor: 'rgba(0, 0, 0, 0.75)', padding: '8px' }}>
          <ClickAwayListener onClickAway={() => setIsOpen(false)}>
            <MenuList>
              <div
                style={{
                  width: '120px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '4px'
                }}
              >
                {COLOR_PALLETE.map((color, index) => (
                  <IconButton
                    key={index}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleColorSelect(color);
                    }}
                    sx={{ padding: '3px', width: '24px', height: '24px' }}
                  >
                    <LensIcon
                      fontSize="small"
                      style={{ color: `rgb(${color})`, width: '20px', height: '20px' }}
                    />
                  </IconButton>
                ))}
              </div>
            </MenuList>
          </ClickAwayListener>
        </Paper>
      </Popper>
    </>
  );
};
