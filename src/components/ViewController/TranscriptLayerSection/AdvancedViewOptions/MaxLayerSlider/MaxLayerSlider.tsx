import { Box, Theme, Tooltip, tooltipClasses, Typography } from '@mui/material';
import { GxSlider } from '../../../../../shared/components/GxSlider';
import { useBinaryFilesStore } from '../../../../../stores/BinaryFilesStore';
import { MaxLayerSliderMark, MaxLayerSliderProps } from './MaxLayerSlider.types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranscriptLayerStore } from '../../../../../stores/TranscriptLayerStore';
import { useShallow } from 'zustand/react/shallow';
import { triggerViewerRerender } from '../AdvancedViewOptions.helpers';
import InfoIcon from '@mui/icons-material/Info';
import { useTranslation } from 'react-i18next';

export const MaxLayerSlider = ({ disabled }: MaxLayerSliderProps) => {
  const { t } = useTranslation();
  const [sliderValuer, setSliderValue] = useState(0);
  const { layers } = useBinaryFilesStore((store) => store.layerConfig);
  const [maxVisibleLayers] = useTranscriptLayerStore(useShallow((store) => [store.maxVisibleLayers]));

  useEffect(() => {
    if (maxVisibleLayers) {
      setSliderValue(maxVisibleLayers);
    }
  }, [maxVisibleLayers]);

  const sliderMarks: MaxLayerSliderMark[] = useMemo(
    () =>
      Array.from({ length: layers + 1 }, (_, i) => ({
        value: i,
        label: `${+(Math.pow(0.2, i) * 100).toPrecision(2) / 1}%`
      })),
    [layers]
  );

  const onMaxLayerChange = useCallback((newValue: number) => {
    useTranscriptLayerStore.setState({ maxVisibleLayers: newValue });
    triggerViewerRerender();
  }, []);

  return (
    <Box sx={sx.sliderWrapper}>
      <Box sx={sx.textWrapper}>
        <Typography
          sx={{
            ...(disabled ? { color: 'rgb(128, 128, 128)' } : {})
          }}
        >
          {t('transcriptsSettings.subsamplingSliderLabel')}
        </Typography>
        <Tooltip
          title={t('transcriptsSettings.subsamplingSliderTootlip')}
          placement="top"
          arrow
          slotProps={{ popper: { sx: sx.infoTooltip } }}
          disableHoverListener={disabled}
        >
          <InfoIcon
            sx={{
              ...(disabled ? { color: 'rgb(128, 128, 128)' } : sx.infoIcon)
            }}
          />
        </Tooltip>
      </Box>
      <GxSlider
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
  );
};

const sx = {
  sliderWrapper: {
    gap: '24px',
    padding: '0 24px 0 16px'
  },
  textWrapper: {
    display: 'flex',
    gap: '8px'
  },
  infoTooltip: {
    [`&.${tooltipClasses.popper}[data-popper-placement*="top"] .${tooltipClasses.tooltip}`]: {
      marginBottom: '0px'
    }
  },
  infoIcon: {
    color: (theme: Theme) => theme.palette.gx.accent.info
  }
};
