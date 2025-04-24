import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Grid, IconButton, MenuItem, Popover, Theme, Typography, useTheme } from '@mui/material';
import { GxSelect } from '../../../../../../shared/components/GxSelect';
import { GxInput } from '../../../../../../shared/components/GxInput';
import SettingsIcon from '@mui/icons-material/Settings';
import { SelectOption, ColorScaleOption } from './CytometrySettingsMenu.types';
import { debounce } from 'lodash';
import { useCytometryGraphStore } from '../../../../../../stores/CytometryGraphStore/CytometryGraphStore';
import {
  AVAILABLE_AXIS_TYPES,
  AVAILABLE_COLORSCALES,
  AVAILABLE_EXPONENT_FORMATS
} from '../../../../../../stores/CytometryGraphStore/CytometryGraphStore.types';

export const CytometrySettingsMenu = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const { updateSettings } = useCytometryGraphStore();
  const menenuAnchor = useRef(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [binSizeInput, setBinSizeInput] = useState('');
  const [axisTypeInput, setAxisTypeInput] = useState<SelectOption | undefined>(undefined);
  const [exponentFormatInput, setExponentFormatInput] = useState<SelectOption | undefined>(undefined);
  const [colorscaleInput, setColorscaleInput] = useState<ColorScaleOption | undefined>(undefined);

  useEffect(() => {
    const { binSize, colorscale, axisType, exponentFormat } = useCytometryGraphStore.getState().settings;

    const matchingAxisOption = AVAILABLE_AXIS_TYPES.find((item) => item.value === axisType);
    const matchingExponentFormatOption = AVAILABLE_EXPONENT_FORMATS.find((item) => item.value === exponentFormat);

    setColorscaleInput(colorscale);
    setBinSizeInput(binSize.toString());
    if (matchingAxisOption) {
      setAxisTypeInput(matchingAxisOption);
    }
    if (matchingExponentFormatOption) {
      setExponentFormatInput(matchingExponentFormatOption);
    }
  }, []);

  const onColorscaleSelect = useCallback(
    (newColorScale: string) => {
      const colorscale = AVAILABLE_COLORSCALES.find((item) => item.label === newColorScale);
      if (colorscale) {
        updateSettings({ colorscale });
        setColorscaleInput(colorscale);
      }
    },
    [updateSettings]
  );

  const onAxisTypeSelect = useCallback(
    (newAxisType: string) => {
      const axisTypeOption = AVAILABLE_AXIS_TYPES.find((item) => item.label === newAxisType);
      if (axisTypeOption) {
        setAxisTypeInput(axisTypeOption);
        updateSettings({ axisType: axisTypeOption.value });
      }
    },
    [updateSettings]
  );

  const onExponentFormatSelect = useCallback(
    (newExponentFormat: string) => {
      const exponentFormatOption = AVAILABLE_EXPONENT_FORMATS.find((item) => item.label === newExponentFormat);
      if (exponentFormatOption) {
        setExponentFormatInput(exponentFormatOption);
        updateSettings({ exponentFormat: exponentFormatOption.value });
      }
    },
    [updateSettings]
  );

  const handleBinSizeChange = useMemo(
    () =>
      debounce((newBinSize: number) => {
        updateSettings({ binSize: newBinSize });
      }, 350),
    [updateSettings]
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
          sx={{ width: '400px' }}
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
          <Grid
            alignContent={'center'}
            size={1}
          >
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
          <Grid
            alignContent={'center'}
            size={1}
          >
            <Typography>Axis type:</Typography>
          </Grid>
          <Grid size={1}>
            <GxSelect
              fullWidth
              size="small"
              value={axisTypeInput?.label}
              onChange={(e) => onAxisTypeSelect(e.target.value as string)}
              MenuProps={{ sx: { zIndex: 3000 } }}
            >
              {AVAILABLE_AXIS_TYPES.map((item) => (
                <MenuItem
                  key={item.label}
                  value={item.label}
                >
                  {item.label}
                </MenuItem>
              ))}
            </GxSelect>
          </Grid>
          <Grid
            alignContent={'center'}
            size={1}
          >
            <Typography>Exponent format:</Typography>
          </Grid>
          <Grid size={1}>
            <GxSelect
              fullWidth
              size="small"
              value={exponentFormatInput?.label}
              onChange={(e) => onExponentFormatSelect(e.target.value as string)}
              MenuProps={{ sx: { zIndex: 3000 } }}
            >
              {AVAILABLE_EXPONENT_FORMATS.map((item) => (
                <MenuItem
                  key={item.label}
                  value={item.label}
                >
                  {item.label}
                </MenuItem>
              ))}
            </GxSelect>
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
