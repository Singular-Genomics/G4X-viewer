import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Grid, IconButton, MenuItem, Popover, Theme, Typography, useTheme } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { SelectOption, ColorScaleOption } from './CytometrySettingsMenu.types';
import { debounce } from 'lodash';
import { useCytometryGraphStore } from '../../../../../../../stores/CytometryGraphStore/CytometryGraphStore';
import {
  AVAILABLE_AXIS_TYPES,
  AVAILABLE_COLORSCALES,
  AVAILABLE_EXPONENT_FORMATS
} from '../../../../../../../stores/CytometryGraphStore/CytometryGraphStore.types';
import { GxSelect } from '../../../../../../../shared/components/GxSelect';
import { GxInput } from '../../../../../../../shared/components/GxInput';
import { GxCheckbox } from '../../../../../../../shared/components/GxCheckbox';

export const CytometrySettingsMenu = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const { updateSettings } = useCytometryGraphStore();
  const menenuAnchor = useRef(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [binXCountInput, setBinXCountInput] = useState('');
  const [binYCountInput, setBinYCountInput] = useState('');
  const [axisTypeInput, setAxisTypeInput] = useState<SelectOption | undefined>(undefined);
  const [exponentFormatInput, setExponentFormatInput] = useState<SelectOption | undefined>(undefined);
  const [colorscaleInput, setColorscaleInput] = useState<ColorScaleOption | undefined>(undefined);

  useEffect(() => {
    const { binCountX, binCountY, colorscale, axisType, exponentFormat } = useCytometryGraphStore.getState().settings;

    const matchingAxisOption = AVAILABLE_AXIS_TYPES.find((item) => item.value === axisType);

    const matchingExponentFormatOption = AVAILABLE_EXPONENT_FORMATS.find((item) => item.value === exponentFormat);

    setColorscaleInput(colorscale);
    setBinXCountInput(binCountX.toString());
    setBinYCountInput(binCountY.toString());

    if (matchingAxisOption) {
      setAxisTypeInput(matchingAxisOption);
    }

    if (matchingExponentFormatOption) {
      setExponentFormatInput(matchingExponentFormatOption);
    }
  }, []);

  const onColorscaleSelect = useCallback(
    (newColorScale: string) => {
      const colorscaleConfig = AVAILABLE_COLORSCALES.find((item) => item.label === newColorScale);
      if (colorscaleConfig) {
        updateSettings({ colorscale: { ...colorscaleConfig, reversed: !!colorscaleInput?.reversed } });
        setColorscaleInput((prev) => prev && { ...colorscaleConfig, reversed: prev.reversed });
      }
    },
    [updateSettings, colorscaleInput?.reversed]
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
      debounce((newBinSize: number, axis: 'x' | 'y') => {
        updateSettings(axis === 'x' ? { binCountX: newBinSize } : { binCountY: newBinSize });
      }, 350),
    [updateSettings]
  );

  const onBinSizeInput = useCallback(
    (newBinSize: string, axis: 'x' | 'y') => {
      if (axis === 'x') {
        setBinXCountInput(newBinSize);
      } else {
        setBinYCountInput(newBinSize);
      }

      if (newBinSize && Number(newBinSize) > 1) {
        handleBinSizeChange(Number(newBinSize), axis);
      }
    },
    [handleBinSizeChange]
  );

  const onReverseColorscale = useCallback(() => {
    if (colorscaleInput) {
      updateSettings({ colorscale: { ...colorscaleInput, reversed: !colorscaleInput?.reversed } });
      setColorscaleInput((prev) => prev && { ...prev, reversed: !prev.reversed });
    }
  }, [colorscaleInput, updateSettings]);

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
          sx={{ width: '300px' }}
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
            <Typography>Reverse colorscale:</Typography>
          </Grid>
          <Grid>
            <GxCheckbox
              value={colorscaleInput?.reversed}
              onClick={onReverseColorscale}
            />
          </Grid>
          <Grid
            alignContent={'center'}
            size={1}
          >
            <Typography>Bin count (X):</Typography>
            <Typography sx={sx.helperText}>Min 2</Typography>
          </Grid>
          <Grid size={1}>
            <GxInput
              fullWidth
              value={binXCountInput}
              type="number"
              variant="standard"
              error={+binXCountInput < 2}
              onChange={(e) => onBinSizeInput(e.target.value, 'x')}
            />
          </Grid>
          <Grid
            alignContent={'center'}
            size={1}
          >
            <Typography>Bin count (Y):</Typography>
            <Typography sx={sx.helperText}>Min 2</Typography>
          </Grid>
          <Grid size={1}>
            <GxInput
              fullWidth
              value={binYCountInput}
              type="number"
              variant="standard"
              error={+binYCountInput < 2}
              onChange={(e) => onBinSizeInput(e.target.value, 'y')}
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
  },
  helperText: {
    fontSize: '11px',
    color: theme.palette.gx.mediumGrey[100]
  }
});
