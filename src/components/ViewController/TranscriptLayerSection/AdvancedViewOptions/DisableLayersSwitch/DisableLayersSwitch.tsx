import { FormControlLabel } from "@mui/material";
import { GxSwitch } from "../../../../../shared/components/GxSwitch";
import { useViewerStore } from "../../../../../stores/ViewerStore";
import { useCallback } from "react";
import { useTranscriptLayerStore } from "../../../../../stores/TranscriptLayerStore";
import { useShallow } from "zustand/react/shallow";
import { DisableLayersSwitchProps } from "./DisableLayersSwitch.types";

export const DisableLayersSwitch = ({ disabled }: DisableLayersSwitchProps) => {
  const { viewState: oldViewState } = useViewerStore();
  const [disableTiledView, toggleDisableTiledView] = useTranscriptLayerStore(
    useShallow((store) => [
      store.disableTiledView,
      store.toggleDisableTiledView,
    ])
  );

  const handleClick = useCallback(() => {
    toggleDisableTiledView();
    useViewerStore.setState({
      viewState: {
        ...oldViewState,
        zoom: oldViewState.zoom + 0.0001,
      },
    });
  }, [oldViewState, toggleDisableTiledView]);

  return (
    <FormControlLabel
      label="Show all transcripts"
      disabled={disabled}
      control={<GxSwitch checked={disableTiledView} onChange={handleClick} />}
    />
  );
};
