import { Box, Typography } from "@mui/material";
import { GxSlider } from "../../../../../shared/components/GxSlider";
import { useBinaryFilesStore } from "../../../../../stores/BinaryFilesStore";
import {
  MaxLayerSliderMark,
  MaxLayerSliderProps,
} from "./MaxLayerSlider.types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranscriptLayerStore } from "../../../../../stores/TranscriptLayerStore";
import { useShallow } from "zustand/react/shallow";
import { useViewerStore } from "../../../../../stores/ViewerStore";

export const MaxLayerSlider = ({ disabled }: MaxLayerSliderProps) => {
  const [sliderValuer, setSliderValue] = useState(0);
  const { layers } = useBinaryFilesStore((store) => store.layerConfig);
  const { viewState: oldViewState } = useViewerStore();
  const [maxVisibleLayers, disableTiledView] = useTranscriptLayerStore(
    useShallow((store) => [store.maxVisibleLayers, store.disableTiledView])
  );

  useEffect(() => {
    if (maxVisibleLayers) {
      setSliderValue(maxVisibleLayers);
    }
  }, [maxVisibleLayers]);

  const sliderMarks: MaxLayerSliderMark[] = useMemo(
    () =>
      Array.from({ length: layers }, (_, i) => ({
        value: i,
        label: i.toString(),
      })),
    [layers]
  );

  const onMaxLayerChange = useCallback(
    (newValue: number) => {
      useTranscriptLayerStore.setState({ maxVisibleLayers: newValue });
      useViewerStore.setState({
        viewState: {
          ...oldViewState,
          zoom: oldViewState.zoom + 0.0001,
        },
      });
    },
    [oldViewState]
  );

  const disableControls = disabled || disableTiledView;

  return (
    <Box sx={sx.sliderWrapper}>
      <Typography
        sx={{
          ...(disableControls ? { color: "rgb(128, 128, 128)" } : {}),
        }}
      >
        Max visble layers
      </Typography>
      <GxSlider
        max={layers}
        min={0}
        step={1}
        marks={sliderMarks}
        value={sliderValuer}
        disabled={disableControls}
        onChangeCommitted={(_, newValue) =>
          onMaxLayerChange(newValue as number)
        }
        onChange={(_, newValue) => setSliderValue(newValue as number)}
      />
    </Box>
  );
};

const sx = {
  sliderWrapper: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "24px",
    paddingRight: "24px",
  },
};
