import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Grid, IconButton, MenuItem, Popover, Theme, Typography, useTheme } from '@mui/material';
import { GxSelect } from '../../../../../../shared/components/GxSelect';
import { GxInput } from '../../../../../../shared/components/GxInput';
import SettingsIcon from '@mui/icons-material/Settings';
import { GetBrandColorscale } from './CytometrySettingsMenu.helpers';
import { ColorScaleOption, CytometrySettingsMenuProps, HeatmapSettings } from './CytometrySettingsMenu.types';
import { useSnackbar } from 'notistack';
import { debounce } from 'lodash';

const SETTINGS_FLAG = 'HeatmapSettings';

const AVAILABLE_COLORSCALES: ColorScaleOption[] = [
  { label: 'Singular', value: GetBrandColorscale() },
  { label: 'YlGnBu', value: 'YlGnBu' },
  { label: 'YlOrRd', value: 'YlOrRd' },
  { label: 'RdBu', value: 'RdBu' },
  { label: 'Portland', value: 'Portland' },
  { label: 'Picnic', value: 'Picnic' },
  { label: 'Jet', value: 'Jet' },
  { label: 'Hot', value: 'Hot' },
  { label: 'Greys', value: 'Greys' },
  { label: 'Greens', value: 'Greens' },
  { label: 'Electric', value: 'Electric' },
  { label: 'Earth', value: 'Earth' },
  { label: 'Bluered', value: 'Bluered' }
];

const DEFAULT_BIN_SIZE = 100;

export const CytometrySettingsMenu = ({ onBinSizeChange, onColorscaleChange }: CytometrySettingsMenuProps) => {
  const theme = useTheme();
  const sx = styles(theme);
  const { enqueueSnackbar } = useSnackbar();
  const settings = useRef<HeatmapSettings | undefined>(undefined);
  const menenuAnchor = useRef(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [binSizeInput, setBinSizeInput] = useState('');
  const [colorscaleInput, setColorscaleInput] = useState<ColorScaleOption | undefined>(undefined);

  useEffect(() => {
    const savedSettingsJson = window.localStorage.getItem(SETTINGS_FLAG);
    let parsedSettings;
    try {
      parsedSettings = savedSettingsJson ? (JSON.parse(savedSettingsJson) as HeatmapSettings) : undefined;
    } catch {
      enqueueSnackbar({
        message: 'Failed to retrive previous session settings. Default values will be used',
        variant: 'warning'
      });
    }

    const matchingOption =
      parsedSettings && parsedSettings.colorscaleName
        ? AVAILABLE_COLORSCALES.find((item) => item.label === parsedSettings.colorscaleName)
        : undefined;

    const binSize = parsedSettings?.binSize || DEFAULT_BIN_SIZE;

    onColorscaleChange(matchingOption?.value || AVAILABLE_COLORSCALES[0].value);
    setColorscaleInput(matchingOption || AVAILABLE_COLORSCALES[0]);
    onBinSizeChange(binSize);
    setBinSizeInput(binSize.toString());
    settings.current = parsedSettings;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onColorscaleSelect = useCallback(
    (newColorScale: string) => {
      const colorscale = AVAILABLE_COLORSCALES.find((item) => item.label === newColorScale);
      if (colorscale) {
        setColorscaleInput(colorscale);
        onColorscaleChange(colorscale.value);
        if (!settings.current) {
          settings.current = { colorscaleName: newColorScale };
        } else {
          settings.current = { ...settings.current, colorscaleName: newColorScale };
        }

        localStorage.setItem(SETTINGS_FLAG, JSON.stringify(settings.current));
      }
    },
    [onColorscaleChange]
  );

  const handleBinSizeChange = useMemo(
    () =>
      debounce((newBinSize: number) => {
        onBinSizeChange(newBinSize);
        if (!settings.current) {
          settings.current = { binSize: newBinSize };
        } else {
          settings.current = { ...settings.current, binSize: newBinSize };
        }

        localStorage.setItem(SETTINGS_FLAG, JSON.stringify(settings.current));
      }, 350),
    [onBinSizeChange]
  );

  const onBinSizeInput = useCallback(
    (newBinSize: string) => {
      setBinSizeInput(newBinSize);
      handleBinSizeChange(Number(newBinSize));
    },
    [handleBinSizeChange]
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
              value={colorscaleInput?.label}
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
              value={binSizeInput}
              type="number"
              variant="standard"
              onChange={(e) => onBinSizeInput(e.target.value)}
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
