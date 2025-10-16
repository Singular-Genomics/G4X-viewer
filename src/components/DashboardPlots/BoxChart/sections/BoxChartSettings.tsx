import { Box, Grid, MenuItem, SxProps, Theme, Typography, useTheme } from '@mui/material';
import { GxCheckbox } from '../../../../shared/components/GxCheckbox';
import { GxSelect } from '../../../../shared/components/GxSelect';
import { BoxChartDataMode, BoxChartSettingsProps } from './BoxChartSettings.types';
import { useTranslation } from 'react-i18next';

const AVAILABLE_DATA_MODES: BoxChartDataMode[] = ['all', 'outliers', 'suspectedoutliers', 'none'];

export const BoxChartSettings = ({ settings, onChangeSettings }: BoxChartSettingsProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const sx = styles(theme);

  return (
    <Box>
      <Grid
        container
        columns={2}
        columnSpacing={1}
        sx={sx.container}
      >
        {/* Axis Swap  */}
        <Grid
          size={1}
          alignContent={'center'}
          sx={sx.settingLabel}
        >
          <Typography>{t('dashboard.boxPlotSwapAxisLabel')}:</Typography>
        </Grid>
        <Grid size={1}>
          <GxCheckbox
            value={settings.swapAxis}
            onChange={() =>
              onChangeSettings({
                ...settings,
                swapAxis: !settings.swapAxis
              })
            }
          />
        </Grid>
        {/* Box point type  */}
        <Grid
          size={1}
          alignContent={'center'}
          sx={sx.settingLabel}
        >
          <Typography>{t('dashboard.boxPlotDataModeLabel')}:</Typography>
        </Grid>
        <Grid size={1}>
          <GxSelect
            fullWidth
            size="small"
            value={settings.dataMode}
            onChange={(e) =>
              onChangeSettings({
                ...settings,
                dataMode: e.target.value as BoxChartDataMode
              })
            }
            MenuProps={{ sx: { zIndex: 3000 } }}
          >
            {AVAILABLE_DATA_MODES.map((item) => (
              <MenuItem
                key={item}
                value={item}
              >
                {item}
              </MenuItem>
            ))}
          </GxSelect>
        </Grid>
      </Grid>
    </Box>
  );
};

const styles = (theme: Theme): Record<string, SxProps> => ({
  container: {
    width: '350px'
  },
  settingLabel: {
    borderRight: '2px solid',
    borderColor: theme.palette.gx.mediumGrey[500],
    textWrap: 'nowrap',
    textAlign: 'end',
    paddingInlineEnd: '8px'
  }
});
