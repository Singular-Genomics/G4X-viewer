import { Box, Grid, MenuItem, Typography } from '@mui/material';
import { HeatmapChartSettingsProps } from './HeatmapChartSettings.types';
import { AVAILABLE_COLORSCALES } from '../../../../../stores/CytometryGraphStore/CytometryGraphStore.types';
import { GxSelect } from '../../../../../shared/components/GxSelect';
import { GxCheckbox } from '../../../../../shared/components/GxCheckbox';
import { useTranslation } from 'react-i18next';

export const HeatmapChartSettings = ({ settings, onChangeSettings }: HeatmapChartSettingsProps) => {
  const { t } = useTranslation();

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
    <Box sx={{ padding: '8px' }}>
      <Grid
        container
        columns={2}
        rowSpacing={1}
        sx={{ width: '100%' }}
      >
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
            value={settings.colorscale?.label || ''}
            onChange={(e) => onColorscaleSelect(e.target.value as string)}
            MenuProps={{ sx: { zIndex: 10000 } }}
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
            value={settings.colorscale?.reversed || false}
            onClick={onReverseColorscale}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
