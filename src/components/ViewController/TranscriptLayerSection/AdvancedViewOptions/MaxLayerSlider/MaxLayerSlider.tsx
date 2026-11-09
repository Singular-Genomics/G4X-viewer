import { SettingsTooltip as Tooltip } from '../../../../../shared/components/SettingsHelp';
import { getSliderHandleStyles } from '../../../../../shared/components/sliderControls.styles';
import { Box, useTheme } from '@mui/material';
import { GxSlider } from '../../../../../shared/components/GxSlider';
import { useZarrDataStore } from '../../../../../stores/ZarrDataStore';
import { MaxLayerSliderMark, MaxLayerSliderProps } from './MaxLayerSlider.types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranscriptLayerStore } from '../../../../../stores/TranscriptLayerStore';
import { useShallow } from 'zustand/react/shallow';
import { triggerViewerRerender } from '../AdvancedViewOptions.helpers';
import { useTranslation } from 'react-i18next';

export const MaxLayerSlider = ({ disabled }: MaxLayerSliderProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const [sliderValuer, setSliderValue] = useState(0);
  const { layers } = useZarrDataStore((store) => store.layerConfig);
  const [maxVisibleLayers] = useTranscriptLayerStore(useShallow((store) => [store.maxVisibleLayers]));

  useEffect(() => {
    if (maxVisibleLayers === null) {
      useTranscriptLayerStore.setState({ maxVisibleLayers: layers });
    } else {
      setSliderValue(layers - maxVisibleLayers);
    }
  }, [maxVisibleLayers, layers]);

  const sliderMarks: MaxLayerSliderMark[] = useMemo(
    () =>
      Array.from({ length: layers + 1 }, (_, i) => ({
        value: layers - i,
        label:
          i === 0 ? (
            '1'
          ) : i === 1 ? (
            '1/5'
          ) : (
            <span>
              1/5<sup>{i}</sup>
            </span>
          )
      })),
    [layers]
  );

  const onMaxLayerChange = useCallback(
    (newValue: number) => {
      useTranscriptLayerStore.setState({ maxVisibleLayers: layers - newValue });
      triggerViewerRerender();
    },
    [layers]
  );

  return (
    <Tooltip
      title={t('transcriptsSettings.subsamplingSliderTooltip')}
      placement="top"
      arrow
      disableHoverListener={disabled}
    >
      <Box sx={sx.sliderWrapper}>
        <GxSlider
          aria-label={t('transcriptsSettings.subsamplingControlLabel')}
          sx={getSliderHandleStyles(theme)}
          max={layers}
          min={0}
          step={1}
          marks={sliderMarks}
          value={sliderValuer}
          disabled={disabled}
          onChangeCommitted={(_, newValue) => onMaxLayerChange(newValue as number)}
          onChange={(_, newValue) => setSliderValue(newValue as number)}
        />
      </Box>
    </Tooltip>
  );
};

const sx = {
  sliderWrapper: {
    minWidth: 0,
    padding: '0 16px 16px',
    '& .MuiSlider-markLabel': {
      lineHeight: '20px',
      '& sup': {
        position: 'relative',
        top: '-0.5em',
        verticalAlign: 'baseline',
        lineHeight: 0,
        fontSize: '75%'
      }
    }
  }
};
