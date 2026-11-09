import { SettingsTooltip } from '../../../../shared/components/SettingsHelp';
import { getAppearanceControlStyles } from '../../../../shared/components/appearanceControl.styles';
import { Box, ToggleButton, Input, SxProps, Theme, Typography, useTheme } from '@mui/material';
import { useCellSegmentationLayerStore } from '../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { useShallow } from 'zustand/react/shallow';
import { GxSlider } from '../../../../shared/components/GxSlider';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GxModal } from '../../../../shared/components/GxModal';

const MIN_BOUNDARY_WIDTH = 0.2;
const MAX_BOUNDARY_WIDTH = 3;
const BOUNDARY_WIDTH_STEP = 0.1;

export const CellMasksBoundarySettings = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const { t } = useTranslation();

  const [showCellFill, showBoundary, boundaryWidth, toggleBoundary, setBoundaryWidth] = useCellSegmentationLayerStore(
    useShallow((store) => [
      store.showCellFill,
      store.showBoundary,
      store.boundaryWidth,
      store.toggleBoundary,
      store.setBoundaryWidth
    ])
  );

  const [sliderValue, setSliderValue] = useState<number>(boundaryWidth);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [inputValue, setInputValue] = useState(boundaryWidth.toFixed(1));

  useEffect(() => {
    setSliderValue(boundaryWidth);
    setInputValue(boundaryWidth.toFixed(1));
  }, [boundaryWidth]);

  const handleToggleBoundary = () => {
    const disableModal = localStorage.getItem('disableBoundaryWarning_DSA');
    if (disableModal || showBoundary) {
      toggleBoundary();
    } else {
      setIsModalOpen(true);
    }
  };

  const onContinue = () => {
    setIsModalOpen(false);
    toggleBoundary();
  };

  const commitInputValue = () => {
    const parsed = inputValue.trim() === '' ? NaN : Number(inputValue);
    const clamped = Number.isFinite(parsed)
      ? Math.min(MAX_BOUNDARY_WIDTH, Math.max(MIN_BOUNDARY_WIDTH, parsed))
      : sliderValue;
    const value = +clamped.toFixed(1);
    setInputValue(String(value));
    setSliderValue(value);
    setBoundaryWidth(value);
  };

  return (
    <>
      <SettingsTooltip
        title={t('settingsHelp.controls.border')}
        helpTitle={t('segmentationSettings.borderToggleLabel')}
      >
        <Box sx={sx.strokeSettingsContainer}>
          <ToggleButton
            value="border"
            selected={showBoundary}
            onChange={handleToggleBoundary}
            disabled={showBoundary && !showCellFill}
            color="primary"
            sx={sx.toggleButton}
          >
            {t('segmentationSettings.borderToggleLabel')}
          </ToggleButton>
          <Box sx={sx.sliderInputContainer}>
            <Typography
              id="cell-border-width-label"
              component="label"
              sx={sx.label}
            >
              {t('segmentationSettings.borderWidthLabel')}
            </Typography>
            <Box sx={sx.sliderInputItem}>
              <GxSlider
                sx={sx.sliderControl}
                aria-labelledby="cell-border-width-label"
                value={sliderValue}
                onChange={(_, newValue) => {
                  const value = Array.isArray(newValue) ? newValue[0] : newValue;
                  setSliderValue(+value.toFixed(1));
                  setInputValue(value.toFixed(1));
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
            </Box>
            <Box sx={{ width: 52, flexShrink: 0 }}>
              <Input
                disableUnderline
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onBlur={commitInputValue}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.currentTarget.querySelector('input')?.blur();
                  }
                }}
                size="small"
                type="number"
                inputProps={{
                  'aria-labelledby': 'cell-border-width-label',
                  step: BOUNDARY_WIDTH_STEP.toString(),
                  max: MAX_BOUNDARY_WIDTH.toString(),
                  min: MIN_BOUNDARY_WIDTH.toString()
                }}
                sx={sx.input}
                disabled={!showBoundary}
              />
            </Box>
          </Box>
        </Box>
      </SettingsTooltip>
      <GxModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onContinue={onContinue}
        title={t('general.warning')}
        colorVariant="danger"
        iconVariant="danger"
        dontShowFlag="disableBoundaryWarning_DSA"
      >
        <Typography sx={sx.modalContentText}>{t('segmentationSettings.boundaryPerformanceWarning')}</Typography>
        <Typography
          component={'span'}
          sx={sx.modalContentText}
        >
          <ul>
            <li>{t('segmentationSettings.boundaryPerformanceWarningCaseOne')}</li>
            <li>{t('segmentationSettings.boundaryPerformanceWarningCaseTwo')}</li>
          </ul>
        </Typography>
      </GxModal>
    </>
  );
};
const styles = (theme: Theme): Record<string, SxProps<Theme>> => {
  const controls = getAppearanceControlStyles(theme);
  return {
    ...controls,
    strokeSettingsContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '8px'
    },
    sliderInputContainer: {
      display: 'flex',
      flex: 1,
      minWidth: 0,
      alignItems: 'center',
      gap: '8px'
    },
    sliderInputItem: controls.slider,
    modalContentText: {
      fontWeight: 'bold'
    }
  };
};
