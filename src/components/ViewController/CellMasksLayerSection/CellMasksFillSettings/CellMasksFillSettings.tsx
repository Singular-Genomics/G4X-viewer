import { Box, Grid, Input, Theme, useTheme } from '@mui/material';
import { useCellSegmentationLayerStore } from '../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useShallow } from 'zustand/react/shallow';
import { GxSlider } from '../../../../shared/components/GxSlider';
import { useEffect, useState } from 'react';

const MIN_FILL_OPACITY = 1;
const MAX_FILL_OPACITY = 100;
const FILL_OPACITY_STEP = 1;

export const CellMasksFillSettings = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const [cellFillOpacity, setCellFillOpacity] = useCellSegmentationLayerStore(
    useShallow((store) => [store.cellFillOpacity, store.setCellFillOpacity])
  );

  const [sliderValue, setSliderValue] = useState<number>(cellFillOpacity);

  useEffect(() => {
    setSliderValue(cellFillOpacity);
  }, [cellFillOpacity]);

  return (
    <Box sx={sx.strokeSettingsContainer}>
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
              setCellFillOpacity(sliderValue);
            }}
            valueLabelFormat={(value: number) => `${Math.round(value)}%`}
            step={0.1}
            min={MIN_FILL_OPACITY}
            max={MAX_FILL_OPACITY}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

const styles = (_theme: Theme) => ({
  strokeSettingsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '8px'
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
  }
});
