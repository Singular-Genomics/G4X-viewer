import { FormControlLabel } from "@mui/material";
import { GxSwitch } from "../../../../../shared/components/GxSwitch";
import { useCallback } from "react";
import { useTranscriptLayerStore } from "../../../../../stores/TranscriptLayerStore";
import { useShallow } from "zustand/react/shallow";
import { DisableLayersSwitchProps } from "./DisableLayersSwitch.types";
import { triggerViewerRerender } from "../AdvancedViewOptions.helpers";

export const DisableLayersSwitch = ({ disabled }: DisableLayersSwitchProps) => {
  const [disableTiledView, toggleDisableTiledView] = useTranscriptLayerStore(
    useShallow((store) => [
      store.disableTiledView,
      store.toggleDisableTiledView,
    ])
  );

  const handleClick = useCallback(() => {
    toggleDisableTiledView();
    triggerViewerRerender();
  }, [toggleDisableTiledView]);

  return (
    <FormControlLabel
      label="Show all transcripts"
      disabled={disabled}
      control={<GxSwitch checked={disableTiledView} onChange={handleClick} />}
    />
  );
};
