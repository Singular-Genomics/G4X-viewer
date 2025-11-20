import { Box, Grid, MenuItem, Theme, Typography, useTheme } from '@mui/material';
import {
  HeatmapChartNormalizationAxisOption,
  HeatmapChartNormalizationOption,
  HeatmapChartSettingsProps
} from './HeatmapChartSettings.types';
import { AVAILABLE_COLORSCALES } from '../../../../../stores/CytometryGraphStore/CytometryGraphStore.types';
import { GxSelect } from '../../../../../shared/components/GxSelect';
import { GxCheckbox } from '../../../../../shared/components/GxCheckbox';
import { useTranslation } from 'react-i18next';
import { GxInput } from '../../../../../shared/components/GxInput';

const AVAILABLE_NORMALIZATIONS: HeatmapChartNormalizationOption[] = ['none', 'min-max', 'z-score'];

const AVAILABLE_NORMALIZATION_AXES: { value: HeatmapChartNormalizationAxisOption; label: string }[] = [
  { value: 'y', label: 'Axis Y' },
  { value: 'x', label: 'Axis X' },
  { value: 'both', label: 'Both' }
];

export const HeatmapChartSettings = ({ settings, onChangeSettings }: HeatmapChartSettingsProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const sx = styles(theme);

  const onColorscaleSelect = (newColorScale: string) => {
    const colorscaleConfig = AVAILABLE_COLORSCALES.find((item) => item.label === newColorScale);
    if (colorscaleConfig) {
      const newColorscaleOption = { ...colorscaleConfig, reversed: !!settings.colorscale?.reversed };
      onChangeSettings({ ...settings, colorscale: newColorscaleOption });
    }
  };

  const onReverseColorscale = () => {
    if (settings.colorscale) {
      const newColorscaleOption = { ...settings.colorscale, reversed: !settings.colorscale.reversed };
      onChangeSettings({ ...settings, colorscale: newColorscaleOption });
    }
  };

  const onChangeNormalization = (newNormalization: string) => {
    const normalizationValue = newNormalization as HeatmapChartNormalizationOption;
    const newSettings = {
      ...settings,
      normalization: normalizationValue
    };

    // Set default axis when normalization is enabled
    if (normalizationValue !== 'none' && !settings.normalizationAxis) {
      newSettings.normalizationAxis = 'y';
    }

    onChangeSettings(newSettings);
  };

  const onChangeNormalizationAxis = (newAxis: string) => {
    onChangeSettings({
      ...settings,
      normalizationAxis: newAxis as HeatmapChartNormalizationAxisOption
    });
  };

  return (
    <Box>
      <Grid
        container
        columns={2}
        rowSpacing={1}
        columnSpacing={1}
        sx={sx.container}
      >
        {/* Custom Title  */}
        <Grid
          size={1}
          alignContent={'center'}
          sx={sx.settingLabel}
        >
          <Typography>{t('dashboard.customTitle')}:</Typography>
        </Grid>
        <Grid size={1}>
          <GxInput
            value={settings.customTitle ?? ''}
            size="small"
            onChange={(e) =>
              onChangeSettings({
                ...settings,
                customTitle: e.target.value
              })
            }
          />
        </Grid>
        {/* Colorscale Select */}
        <Grid
          alignContent={'center'}
          sx={sx.settingLabel}
          size={1}
        >
          <Typography>{`${t('segmentationSettings.cytometryMenuColorscale')}:`}</Typography>
        </Grid>
        <Grid size={1}>
          <GxSelect
            fullWidth
            size="small"
            value={settings.colorscale?.label || ''}
            onChange={(e) => onColorscaleSelect(e.target.value as string)}
            MenuProps={{ sx: sx.menu }}
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
          sx={sx.settingLabel}
        >
          <Typography>{`${t('segmentationSettings.cytometryMenuReverseColorscale')}:`}</Typography>
        </Grid>
        <Grid>
          <GxCheckbox
            value={settings.colorscale?.reversed || false}
            onClick={onReverseColorscale}
          />
        </Grid>
        {/* Sort ROIs  */}
        <Grid
          size={1}
          alignContent={'center'}
          sx={sx.settingLabel}
        >
          <Typography>{t('dashboard.plotSortRoisLabel')}:</Typography>
        </Grid>
        <Grid size={1}>
          <GxCheckbox
            value={settings.sortRois}
            onChange={() =>
              onChangeSettings({
                ...settings,
                sortRois: !settings.sortRois
              })
            }
          />
        </Grid>
        {/* Normalization option */}
        <Grid
          alignContent={'center'}
          size={1}
          sx={sx.settingLabel}
        >
          <Typography>{`${t('heatmapChart.normalizationLabel')}:`}</Typography>
        </Grid>
        <Grid size={1}>
          <GxSelect
            fullWidth
            size="small"
            value={settings.normalization || 'none'}
            onChange={(e) => onChangeNormalization(e.target.value as string)}
            MenuProps={{ sx: sx.menu }}
          >
            {AVAILABLE_NORMALIZATIONS.map((option) => (
              <MenuItem
                key={option}
                value={option}
              >
                {option}
              </MenuItem>
            ))}
          </GxSelect>
        </Grid>
        {/* Normalization Axis - only shown when normalization is not 'none' */}
        {settings.normalization && settings.normalization !== 'none' && (
          <>
            <Grid
              alignContent={'center'}
              size={1}
              sx={sx.settingLabel}
            >
              <Typography>{`${t('heatmapChart.normalizationAxisLabel')}:`}</Typography>
            </Grid>
            <Grid size={1}>
              <GxSelect
                fullWidth
                size="small"
                value={settings.normalizationAxis || 'y'}
                onChange={(e) => onChangeNormalizationAxis(e.target.value as string)}
                MenuProps={{ sx: sx.menu }}
              >
                {AVAILABLE_NORMALIZATION_AXES.map((option) => (
                  <MenuItem
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </MenuItem>
                ))}
              </GxSelect>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  container: {
    width: '350px'
  },
  menu: {
    zIndex: 10000
  },
  settingLabel: {
    borderRight: '2px solid',
    borderColor: theme.palette.gx.mediumGrey[500],
    textWrap: 'nowrap',
    textAlign: 'end',
    paddingInlineEnd: '8px'
  }
});
