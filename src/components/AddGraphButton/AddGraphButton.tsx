import { useState } from 'react';
import { Button, Menu, MenuItem } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { AddGraphButtonProps } from './AddGraphButton.types';

export const AddGraphButton = ({ options, onSelectGraph, buttonText = 'Add graph' }: AddGraphButtonProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleSelectOption = (optionId: string) => {
    onSelectGraph(optionId);
    handleCloseMenu();
  };

  return (
    <>
      <Button
        variant="contained"
        endIcon={<AddIcon />}
        onClick={handleOpenMenu}
        sx={sx.addButton}
      >
        {buttonText}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        {options.map((option) => (
          <MenuItem
            key={option.id}
            onClick={() => handleSelectOption(option.id)}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

const sx = {
  addButton: {
    backgroundColor: 'primary.main',
    '&:hover': {
      backgroundColor: 'primary.dark'
    }
  }
};
