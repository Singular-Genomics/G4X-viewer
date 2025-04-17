import { Box, IconButton, Menu, MenuItem, Theme, Typography, useTheme } from '@mui/material';
import { GxSelect } from '../../../../../../shared/components/GxSelect';
import { GxInput } from '../../../../../../shared/components/GxInput';
import SettingsIcon from '@mui/icons-material/Settings';
import { useRef, useState } from 'react';

export const CytometrySettingsMenu = () => {
  const theme = useTheme();
  const sx = styles(theme);

  const menenuAnchor = useRef(null);
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <Box
      sx={sx.settingsButtonWrapper}
      ref={menenuAnchor}
    >
      <IconButton onClick={() => setOpenMenu((prev) => !prev)}>
        <SettingsIcon />
      </IconButton>
      <Menu
        open={openMenu}
        onClose={() => setOpenMenu(false)}
        anchorEl={menenuAnchor.current}
        sx={{ zIndex: 3000 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography>Colorscale:</Typography>
          <GxSelect
            autoWidth
            fullWidth
            size="small"
            MenuProps={{ sx: { zIndex: 3000 } }}
          >
            <MenuItem>YlOrRd</MenuItem>
          </GxSelect>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography>Bin size:</Typography>
          <GxInput variant="standard" />
        </Box>
      </Menu>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  settingsButtonWrapper: {
    height: '100%',
    width: 'min-fit',
    display: 'flex',
    backgroundColor: theme.palette.gx.primary.white,
    marginLeft: '1px',
    padding: '8px'
  }
});
