import { Box, Grid, MenuItem, Theme, Typography, useTheme } from '@mui/material';
import { HeatmapChartSettingsProps } from './HeatmapChartSettings.types';
import { AVAILABLE_COLORSCALES } from '../../../../../stores/CytometryGraphStore/CytometryGraphStore.types';
import { GxSelect } from '../../../../../shared/components/GxSelect';
import { GxCheckbox } from '../../../../../shared/components/GxCheckbox';
import { useTranslation } from 'react-i18next';
import { GxInput } from '../../../../../shared/components/GxInput';

export const HeatmapChartSettings = ({ settings, onChangeSettings }: HeatmapChartSettingsProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const sx = styles(theme);

  const onColorscaleSelect = (newColorScale: string) => {
    const colorscaleConfig = AVAILABLE_COLORSCALES.find((item) => item.label === newColorScale);
    if (colorscaleConfig) {
      const newColorscaleOption = { ...colorscaleConfig, reversed: !!settings.colorscale?.reversed };
      onChangeSettings({ colorscale: newColorscaleOption });
    }
  };

  const onReverseColorscale = () => {
    if (settings.colorscale) {
      const newColorscaleOption = { ...settings.colorscale, reversed: !settings.colorscale.reversed };
      onChangeSettings({ colorscale: newColorscaleOption });
    }
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
