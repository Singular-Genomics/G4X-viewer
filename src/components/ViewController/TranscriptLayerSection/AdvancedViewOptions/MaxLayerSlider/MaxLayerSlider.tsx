import { Box, Theme, Tooltip, tooltipClasses, Typography } from "@mui/material";
import { GxSlider } from "../../../../../shared/components/GxSlider";
import { useBinaryFilesStore } from "../../../../../stores/BinaryFilesStore";
import {
  MaxLayerSliderMark,
  MaxLayerSliderProps,
} from "./MaxLayerSlider.types";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranscriptLayerStore } from "../../../../../stores/TranscriptLayerStore";
import { useShallow } from "zustand/react/shallow";
import { triggerViewerRerender } from "../AdvancedViewOptions.helpers";
import InfoIcon from "@mui/icons-material/Info";

export const MaxLayerSlider = ({ disabled }: MaxLayerSliderProps) => {
  const [sliderValuer, setSliderValue] = useState(0);
  const { layers } = useBinaryFilesStore((store) => store.layerConfig);
  const [maxVisibleLayers] = useTranscriptLayerStore(
    useShallow((store) => [store.maxVisibleLayers])
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

  const onMaxLayerChange = useCallback((newValue: number) => {
    useTranscriptLayerStore.setState({ maxVisibleLayers: newValue });
    triggerViewerRerender();
  }, []);

  return (
    <Box sx={sx.sliderWrapper}>
      <Box sx={sx.textWrapper}>
        <Typography
          sx={{
            ...(disabled ? { color: "rgb(128, 128, 128)" } : {}),
          }}
        >
          Max visble layers
        </Typography>
        <Tooltip
          title="Control the resolution of the min zoom layer"
          placement="top"
          arrow
          slotProps={{ popper: { sx: sx.infoTooltip } }}
          disableHoverListener={disabled}
        >
          <InfoIcon
            sx={{
              ...(disabled ? { color: "rgb(128, 128, 128)" } : sx.infoIcon),
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
    gap: "24px",
    paddingRight: "24px",
  },
  textWrapper: {
    display: "flex",
    gap: "8px",
  },
  infoTooltip: {
    [`&.${tooltipClasses.popper}[data-popper-placement*="top"] .${tooltipClasses.tooltip}`]:
      {
        marginBottom: "0px",
      },
  },
  infoIcon: {
    color: (theme: Theme) => theme.palette.gx.accent.info,
  },
};
