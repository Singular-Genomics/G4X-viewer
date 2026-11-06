import { useShallow } from 'zustand/react/shallow';
import { useZarrDataStore } from '../../../stores/ZarrDataStore';
import { useTranscriptLayerStore } from '../../../stores/TranscriptLayerStore';
import { LAYER_ZOOM_OFFSET } from '../../../shared/constants';
import { Theme, Typography, useTheme } from '@mui/material';
import { useViewerStore } from '../../../stores/ViewerStore';

export const PercentageOfTranscripts = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const viewState = useViewerStore(useShallow((store) => store.viewState));
  const layerConfig = useZarrDataStore(useShallow((store) => store.layerConfig));
  const [maxVisibleLayersRaw, overrideLayers] = useTranscriptLayerStore(
    useShallow((store) => [store.maxVisibleLayers, store.overrideLayers])
  );
  const maxVisibleLayers = maxVisibleLayersRaw ?? layerConfig.layers;

  const zoomBrakePoints = overrideLayers
    ? Array.from(
        { length: maxVisibleLayers },
        (_, i) => i - LAYER_ZOOM_OFFSET + (layerConfig.layers - maxVisibleLayers)
      )
    : Array.from({ length: layerConfig.layers }, (_, i) => i - LAYER_ZOOM_OFFSET);

  const percentageValues = Array.from(
    { length: (overrideLayers ? maxVisibleLayers : layerConfig.layers) + 1 },
    (_, i) => `${+(Math.pow(0.2, i) * 100).toPrecision(2) / 1}`
  ).reverse();

  const currentZoom = viewState?.zoom || 0;

  const percentageOfTranscripts = (() => {
    if (zoomBrakePoints.length === 0) {
      return '100';
    }

    if (currentZoom < zoomBrakePoints[0]) {
      return percentageValues[0];
    }

    if (currentZoom >= zoomBrakePoints[zoomBrakePoints.length - 1]) {
      return percentageValues[percentageValues.length - 1];
    }

    for (let i = 1; i < zoomBrakePoints.length; i++) {
      if (currentZoom >= zoomBrakePoints[i - 1] && currentZoom < zoomBrakePoints[i]) {
        return percentageValues[i];
      }
    }

    return '---';
  })();

  return <Typography sx={sx.footerText}>{percentageOfTranscripts}</Typography>;
};

const styles = (theme: Theme) => ({
  footerText: {
    color: theme.palette.text.primary
  }
});
