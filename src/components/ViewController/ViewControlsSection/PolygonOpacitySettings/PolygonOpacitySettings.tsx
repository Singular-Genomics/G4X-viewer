import { Box, Grid, Input, Theme, Typography, useTheme } from '@mui/material';
import { usePolygonDrawingStore } from '../../../../stores/PolygonDrawingStore';
import { useShallow } from 'zustand/react/shallow';
import { GxSlider } from '../../../../shared/components/GxSlider';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const MIN_POLYGON_OPACITY = 1;
const MAX_POLYGON_OPACITY = 100;
const POLYGON_OPACITY_STEP = 1;

export const PolygonOpacitySettings = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const sx = styles(theme);

  const [polygonOpacity, setPolygonOpacity] = usePolygonDrawingStore(
    useShallow((store) => [store.polygonOpacity, store.setPolygonOpacity])
  );

  const [sliderValue, setSliderValue] = useState<number>(polygonOpacity);

  return (
    <Box sx={sx.opacitySettingsContainer}>
      <Typography sx={sx.subsectionTitle}>{t('viewSettings.polygonLayerOpacity')}</Typography>
      <Grid
        container
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Grid size={1}>
          <Input
            value={Math.round(sliderValue * 100)}
            size="small"
            type="number"
            inputProps={{
              step: POLYGON_OPACITY_STEP.toString(),
              max: MAX_POLYGON_OPACITY.toString(),
              min: MIN_POLYGON_OPACITY.toString()
            }}
            sx={sx.textFieldBase}
            disabled
          />
        </Grid>
        <Grid
          size={'grow'}
          sx={sx.sliderInputItem}
        >
          <GxSlider
            value={sliderValue * 100}
            onChange={(_, newValue) => {
              const value = Array.isArray(newValue) ? newValue[0] : newValue;
              setSliderValue(+(value / 100).toFixed(2));
            }}
            onChangeCommitted={() => {
              setPolygonOpacity(sliderValue);
            }}
            valueLabelFormat={(value: number) => `${Math.round(value)}%`}
            step={0.1}
            min={MIN_POLYGON_OPACITY}
            max={MAX_POLYGON_OPACITY}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  opacitySettingsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '8px'
  },
  subsectionTitle: {
    fontWeight: 700,
    marginBottom: '8px'
  },

  sliderInputItem: {
    padding: '0px 8px 0px 16px'
  },
  textFieldBase: {
    marginBottom: '8px',
    '&.MuiInputBase-root::after': {
      borderBottom: '2px solid'
    },
    '& .MuiInputBase-input': {
      textAlign: 'center',
      WebkitTextFillColor: theme.palette.gx.primary.black
    },
    '&.MuiInputBase-root::before': {
      borderColor: `${theme.palette.gx.primary.black}`,
      borderBottomStyle: 'solid'
    }
  }
});
