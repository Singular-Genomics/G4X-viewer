import { Box, FormControlLabel, Grid, Input, Theme, useTheme } from '@mui/material';
import { useCellSegmentationLayerStore } from '../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useShallow } from 'zustand/react/shallow';
import { GxSwitch } from '../../../../shared/components/GxSwitch';
import { GxSlider } from '../../../../shared/components/GxSlider';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

const MIN_BOUNDARY_WIDTH = 0.2;
const MAX_BOUNDARY_WIDTH = 3;
const BOUNDARY_WIDTH_STEP = 0.1;

export const CellMasksBoundarySettings = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();

  const [showBoundary, boundaryWidth, toggleBoundary, setBoundaryWidth] = useCellSegmentationLayerStore(
    useShallow((store) => [store.showBoundary, store.boundaryWidth, store.toggleBoundary, store.setBoundaryWidth])
  );

  const [sliderValue, setSliderValue] = useState<number>(boundaryWidth);

  return (
    <Box sx={sx.strokeSettingsContainer}>
      <FormControlLabel
        label={t('segmentationSettings.boundaryShow')}
        sx={sx.toggleSwitch}
        control={
          <GxSwitch
            disableTouchRipple
            onChange={toggleBoundary}
            checked={showBoundary}
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
            value={sliderValue.toFixed(1)}
            size="small"
            type="number"
            inputProps={{
              step: BOUNDARY_WIDTH_STEP.toString(),
              max: MAX_BOUNDARY_WIDTH.toString(),
              min: MIN_BOUNDARY_WIDTH.toString()
            }}
            sx={{
              ...sx.textFieldBase,
              ...(showBoundary && sx.textFieldEnabled)
            }}
            disabled
          />
        </Grid>
        <Grid
          size={'grow'}
          sx={sx.sliderInputItem}
        >
          <GxSlider
            value={sliderValue}
            onChange={(_, newValue) => {
              const value = Array.isArray(newValue) ? newValue[0] : newValue;
              setSliderValue(+value.toFixed(1));
            }}
            onChangeCommitted={() => {
              setBoundaryWidth(sliderValue);
            }}
            valueLabelFormat={(value: number) => `${value.toFixed(1)}px`}
            step={BOUNDARY_WIDTH_STEP}
            min={MIN_BOUNDARY_WIDTH}
            max={MAX_BOUNDARY_WIDTH}
            disabled={!showBoundary}
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
