import { Box, FormControlLabel, Grid, Input, Theme, useTheme } from '@mui/material';
import { useCellSegmentationLayerStore } from '../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useShallow } from 'zustand/react/shallow';
import { GxSwitch } from '../../../../shared/components/GxSwitch';
import { GxSlider } from '../../../../shared/components/GxSlider';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const MIN_FILL_OPACITY = 1;
const MAX_FILL_OPACITY = 100;
const FILL_OPACITY_STEP = 1;

export const CellMasksFillSettings = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();

  const [isCellFillOn, cellFillOpacity, toggleCellFill, setCellFillOpacity] = useCellSegmentationLayerStore(
    useShallow((store) => [store.isCellFillOn, store.cellFillOpacity, store.toggleCellFill, store.setCellFillOpacity])
  );

  const [sliderValue, setSliderValue] = useState<number>(cellFillOpacity);

  return (
    <Box sx={sx.strokeSettingsContainer}>
      <FormControlLabel
        label={t('segmentationSettings.cellFillShow')}
        sx={sx.toggleSwitch}
        control={
          <GxSwitch
            disableTouchRipple
            onChange={toggleCellFill}
            checked={isCellFillOn}
          />
        }
      />
      <Grid
        container
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={sx.sliderInputContainer}
      >
        <Grid size={1}>
          <Input
            value={sliderValue * 100}
            size="small"
            type="number"
            inputProps={{
              step: FILL_OPACITY_STEP.toString(),
              max: MAX_FILL_OPACITY.toString(),
              min: MIN_FILL_OPACITY.toString()
            }}
            sx={{
              ...sx.textFieldBase,
              ...(isCellFillOn && sx.textFieldEnabled)
            }}
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
              setCellFillOpacity(sliderValue);
            }}
            valueLabelFormat={(value: number) => `${Math.round(value)}%`}
            step={0.1}
            min={MIN_FILL_OPACITY}
            max={MAX_FILL_OPACITY}
            disabled={!isCellFillOn}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  strokeSettingsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '8px'
  },
  toggleSwitch: {
    paddingLeft: '8px'
  },
  sliderInputContainer: {
    paddingLeft: '8px'
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
      textAlign: 'center'
    }
  },
  textFieldEnabled: {
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
