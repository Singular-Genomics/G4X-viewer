import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, Grid, IconButton, MenuItem, Popover, Theme, Typography, useTheme } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { ColorScaleOption } from './CytometrySettingsMenu.types';
import { debounce } from 'lodash';
import { useCytometryGraphStore } from '../../../../../../../stores/CytometryGraphStore/CytometryGraphStore';
import {
  AVAILABLE_AXIS_TYPES,
  AVAILABLE_COLORSCALES,
  AVAILABLE_EXPONENT_FORMATS,
  AVAILABLE_GRAPH_MODES,
  AxisTypes,
  ExponentFormat,
  GraphMode
} from '../../../../../../../stores/CytometryGraphStore/CytometryGraphStore.types';
import { GxSelect } from '../../../../../../../shared/components/GxSelect';
import { GxInput } from '../../../../../../../shared/components/GxInput';
import { GxCheckbox } from '../../../../../../../shared/components/GxCheckbox';
import { useTranslation } from 'react-i18next';

const MIN_POINT_SIZE = 1;
const MAX_POINT_SIZE = 10;
const MIN_SUBSAMPLE_VALUE = 2;
const MAX_SUBSAMPLE_VALUE = 20;

export const CytometrySettingsMenu = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();
  const { updateSettings, settings } = useCytometryGraphStore();
  const menenuAnchor = useRef(null);
  const [openMenu, setOpenMenu] = useState(false);
  const [binXCountInput, setBinXCountInput] = useState('');
  const [binYCountInput, setBinYCountInput] = useState('');
  const [pointSizeInput, setPointSizeInput] = useState('');
  const [subsamplingInput, setSubsamplingInput] = useState('');
  const [colorscaleInput, setColorscaleInput] = useState<ColorScaleOption | undefined>(undefined);

  useEffect(() => {
    const { binCountX, binCountY, colorscale, subsamplingValue, pointSize } =
      useCytometryGraphStore.getState().settings;

    setColorscaleInput(colorscale);
    setBinXCountInput((binCountX || 0).toString());
    setBinYCountInput((binCountY || 0).toString());
    setSubsamplingInput((subsamplingValue || 0).toString());
    setPointSizeInput((pointSize || 0).toString());
  }, []);

  const onGraphModeChange = (newGraphMode: GraphMode) => {
    updateSettings({ graphMode: newGraphMode });
  };

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

  const onAxisTypeSelect = (newAxisType: AxisTypes) => {
    updateSettings({ axisType: newAxisType });
  };

  const onExponentFormatSelect = (newExponentFormat: ExponentFormat) => {
    updateSettings({ exponentFormat: newExponentFormat });
  };

  const handleBinSizeChange = useMemo(
    () =>
      debounce((newBinSize: number, axis: 'x' | 'y') => {
        updateSettings(axis === 'x' ? { binCountX: newBinSize } : { binCountY: newBinSize });
      }, 350),
    [updateSettings]
  );

  const onBinSizeInput = (newBinSize: string, axis: 'x' | 'y') => {
    if (axis === 'x') {
      setBinXCountInput(newBinSize);
    } else {
      setBinYCountInput(newBinSize);
    }

    if (newBinSize && Number(newBinSize) > 1) {
      handleBinSizeChange(Number(newBinSize), axis);
    }
  };

  const onReverseColorscale = () => {
    if (colorscaleInput) {
      updateSettings({ colorscale: { ...colorscaleInput, reversed: !colorscaleInput?.reversed } });
      setColorscaleInput((prev) => prev && { ...prev, reversed: !prev.reversed });
    }
  };

  const debouncedSettingsUpdate = useMemo(
    () =>
      debounce((newSettings) => {
        updateSettings(newSettings);
      }, 250),
    [updateSettings]
  );

  const handlePointSizeChange = (newValue: string) => {
    setPointSizeInput(newValue);
    if (
      newValue &&
      /^[0-9]*$/.test(newValue) &&
      Number(newValue) >= MIN_POINT_SIZE &&
      Number(newValue) <= MAX_POINT_SIZE
    ) {
      debouncedSettingsUpdate({
        pointSize: Number(newValue)
      });
    }
  };

  const handleSubsamplingChange = (newValue: string) => {
    setSubsamplingInput(newValue);
    if (
      newValue &&
      /^[0-9]*$/.test(newValue) &&
      Number(newValue) >= MIN_SUBSAMPLE_VALUE &&
      Number(newValue) <= MAX_SUBSAMPLE_VALUE
    ) {
      debouncedSettingsUpdate({
        subsamplingValue: Number(newValue)
      });
    }
  };

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
          sx={{ width: '350px' }}
        >
          {/* Graph Mode Select */}
          <Grid
            size={1}
            alignContent={'center'}
          >
            <Typography>{t('segmentationSettings.cytometryMenuMode')}:</Typography>
          </Grid>
          <Grid size={1}>
            <GxSelect
              fullWidth
              size="small"
              value={settings.graphMode}
              onChange={(e) => onGraphModeChange(e.target.value as GraphMode)}
              MenuProps={{ sx: { zIndex: 100 } }}
            >
              {AVAILABLE_GRAPH_MODES.map((item) => (
                <MenuItem
                  key={item}
                  value={item}
                >
                  {t(`segmentationSettings.cytometryMenuGraph_${item}`)}
                </MenuItem>
              ))}
            </GxSelect>
          </Grid>
          {/* Colorscale Select */}
          <Grid
            alignContent={'center'}
            size={1}
          >
            <Typography>{`${t('segmentationSettings.cytometryMenuColorscale')}:`}</Typography>
          </Grid>
          <Grid size={1}>
            <GxSelect
              fullWidth
              size="small"
              value={colorscaleInput?.label}
              onChange={(e) => onColorscaleSelect(e.target.value as string)}
              MenuProps={{ sx: { zIndex: 100 } }}
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
          {/* Reverse Colorscale Checkbox*/}
          <Grid
            alignContent={'center'}
            size={1}
          >
            <Typography>{`${t('segmentationSettings.cytometryMenuReverseColorscale')}:`}</Typography>
          </Grid>
          <Grid>
            <GxCheckbox
              value={colorscaleInput?.reversed}
              onClick={onReverseColorscale}
            />
          </Grid>
          {/* Bin Count X */}
          <Grid
            alignContent={'center'}
            size={1}
          >
            <Typography>{`${t('segmentationSettings.cytometryMenuBinCount')} (X):`}</Typography>
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
          {/* Bin Count Y */}
          <Grid
            alignContent={'center'}
            size={1}
          >
            <Typography>{`${t('segmentationSettings.cytometryMenuBinCount')} (Y):`}</Typography>
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
          {/* Subsampling Input */}
          <Grid
            alignContent={'center'}
            size={1}
          >
            <Typography>{`${t('segmentationSettings.cytometryMenuSubsamplingStep')}:`}</Typography>
            <Typography sx={sx.helperText}>{`Min. ${MIN_SUBSAMPLE_VALUE} | Max. ${MAX_SUBSAMPLE_VALUE}`}</Typography>
          </Grid>
          <Grid size={1}>
            <GxInput
              fullWidth
              type="number"
              variant="standard"
              value={subsamplingInput}
              onChange={(e) => handleSubsamplingChange(e.target.value)}
              error={Number(subsamplingInput) < MIN_SUBSAMPLE_VALUE || Number(subsamplingInput) > MAX_SUBSAMPLE_VALUE}
            />
          </Grid>
          {/* Point Size Input */}
          <Grid
            alignContent={'center'}
            size={1}
          >
            <Typography>{`${t('segmentationSettings.cytometryMenuPointSize')}:`}</Typography>
            <Typography sx={sx.helperText}>{`Min. ${MIN_POINT_SIZE} | Max. ${MAX_POINT_SIZE}`}</Typography>
          </Grid>
          <Grid size={1}>
            <GxInput
              fullWidth
              type="number"
              variant="standard"
              value={pointSizeInput}
              onChange={(e) => handlePointSizeChange(e.target.value)}
              error={Number(pointSizeInput) < MIN_SUBSAMPLE_VALUE || Number(pointSizeInput) > MAX_SUBSAMPLE_VALUE}
            />
          </Grid>
          {/* Axis Type Select */}
          <Grid
            alignContent={'center'}
            size={1}
          >
            <Typography>{`${t('segmentationSettings.cytometryMenuAxisTypeLabel')}:`}</Typography>
          </Grid>
          <Grid size={1}>
            <GxSelect
              fullWidth
              size="small"
              value={settings.axisType}
              onChange={(e) => onAxisTypeSelect(e.target.value as AxisTypes)}
              MenuProps={{ sx: { zIndex: 100 } }}
            >
              {AVAILABLE_AXIS_TYPES.map((item) => (
                <MenuItem
                  key={item}
                  value={item}
                >
                  {t(`segmentationSettings.cytometryMenuAxisType_${item}`)}
                </MenuItem>
              ))}
            </GxSelect>
          </Grid>
          {/* Exponent Format Select */}
          <Grid
            alignContent={'center'}
            size={1}
          >
            <Typography>{`${t('segmentationSettings.cytometryMenuFormatLabel')}:`}</Typography>
          </Grid>
          <Grid size={1}>
            <GxSelect
              fullWidth
              size="small"
              value={settings.exponentFormat}
              onChange={(e) => onExponentFormatSelect(e.target.value as ExponentFormat)}
              MenuProps={{ sx: { zIndex: 100 } }}
            >
              {AVAILABLE_EXPONENT_FORMATS.map((item) => (
                <MenuItem
                  key={item}
                  value={item}
                >
                  {t(`segmentationSettings.cytometryMenuFormat_${item}`)}
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
    zIndex: '100',
    '& .MuiPaper-root': {
      padding: '8px'
    }
  },
  helperText: {
    fontSize: '11px',
    color: theme.palette.gx.mediumGrey[100]
  }
});
