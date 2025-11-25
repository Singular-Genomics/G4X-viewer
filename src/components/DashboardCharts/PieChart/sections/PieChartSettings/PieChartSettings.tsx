import { Box, Grid, SxProps, Theme, Typography, useTheme } from '@mui/material';
import { GxCheckbox } from '../../../../../shared/components/GxCheckbox';
import { PieChartSettingsProps } from './PieChartSettings.types';
import { useTranslation } from 'react-i18next';

export const PieChartSettings = ({ settings, onChangeSettings }: PieChartSettingsProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const sx = styles(theme);

  return (
    <Box>
      <Grid
        container
        columns={2}
        columnSpacing={1}
        rowSpacing={1}
        sx={sx.container}
      >
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
