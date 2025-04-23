import { useCallback, useEffect, useRef, useState } from 'react';
import { ColorScale } from 'plotly.js';
import { Box, Grid, IconButton, MenuItem, Popover, Theme, Typography, useTheme } from '@mui/material';
import { GxSelect } from '../../../../../../shared/components/GxSelect';
import { GxInput } from '../../../../../../shared/components/GxInput';
import SettingsIcon from '@mui/icons-material/Settings';
import { GetBrandColorscale } from './CytometrySettingsMenu.helpers';
import { CytometrySettingsMenuProps } from './CytometrySettingsMenu.types';

const AVAILABLE_COLORSCALES: { label: string; value: ColorScale }[] = [
  { label: 'Singular', value: GetBrandColorscale() },
  { label: 'YlGnBu', value: 'YlGnBu' },
  { label: 'YlOrRd', value: 'YlOrRd' },
  { label: 'RdBu', value: 'RdBu' },
  { label: 'Portland', value: 'Portland' },
  { label: 'Picnic', value: 'Picnic' },
  { label: 'Picnic', value: 'Picnic' },
  { label: 'Jet', value: 'Jet' },
  { label: 'Hot', value: 'Hot' },
  { label: 'Greys', value: 'Greys' },
  { label: 'Greens', value: 'Greens' },
  { label: 'Electric', value: 'Electric' },
  { label: 'Earth', value: 'Earth' },
  { label: 'Bluered', value: 'Bluered' }
];

export const CytometrySettingsMenu = ({ onColorscaleChange }: CytometrySettingsMenuProps) => {
  const theme = useTheme();
  const sx = styles(theme);

  const menenuAnchor = useRef(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [currentColorScale, setCurrentColorScale] = useState<string>('');

  useEffect(() => {
    if (!currentColorScale) {
      setCurrentColorScale(AVAILABLE_COLORSCALES[0].label);
      onColorscaleChange?.(AVAILABLE_COLORSCALES[0].value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onColorscaleChange]);

  const onColorscaleSelect = useCallback(
    (newColorScale: string) => {
      const colorscale = AVAILABLE_COLORSCALES.find((item) => item.label === newColorScale);
      setCurrentColorScale(newColorScale);
      if (colorscale) {
        onColorscaleChange?.(colorscale.value);
      }
    },
    [onColorscaleChange]
  );

  return (
    <Box
      sx={sx.settingsButtonWrapper}
      ref={menenuAnchor}
    >
      <IconButton onClick={() => setOpenMenu((prev) => !prev)}>
        <SettingsIcon />
      </IconButton>
      <Popover
        open={openMenu}
        onClose={() => setOpenMenu(false)}
        anchorEl={menenuAnchor.current}
        sx={sx.settingsMenu}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right'
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right'
        }}
      >
        <Grid
          container
          columns={2}
          rowSpacing={1}
        >
          <Grid
            alignContent={'center'}
            size={1}
          >
            <Typography>Colorscale:</Typography>
          </Grid>
          <Grid size={1}>
            <GxSelect
              fullWidth
              size="small"
              value={currentColorScale}
              onChange={(e) => onColorscaleSelect(e.target.value as string)}
              MenuProps={{ sx: { zIndex: 3000 } }}
            >
              {AVAILABLE_COLORSCALES.map((item) => (
                <MenuItem
                  key={item.label}
                  value={item.label}
                >
                  {item.label}
                </MenuItem>
              ))}
            </GxSelect>
          </Grid>
          <Grid size={1}>
            <Typography>Bin size:</Typography>
          </Grid>
          <Grid size={1}>
            <GxInput
              fullWidth
              variant="standard"
            />
          </Grid>
        </Grid>
      </Popover>
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
  },
  settingsMenu: {
    zIndex: '3000',
    '& .MuiPaper-root': {
      padding: '8px'
    }
  }
});
