import { useCallback, useState } from "react";
import { TranscriptLayerWarningModal } from "./TranscriptLayerWarningModal";
import { Box, FormControlLabel } from "@mui/material";
import { GxSwitch } from "../../../../shared/components/GxSwitch";
import { useTranscriptLayerStore } from "../../../../stores/TranscriptLayerStore";
import { useShallow } from "zustand/react/shallow";
import { useViewerStore } from "../../../../stores/ViewerStore";

export const AdvanedViewOptions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [disableTiledView, toggleDisableTiledView] = useTranscriptLayerStore(
    useShallow((store) => [
      store.disableTiledView,
      store.toggleDisableTiledView,
    ])
  );
  const { viewState: oldViewState } = useViewerStore();

  const handleToggleChange = useCallback(() => {
    toggleDisableTiledView();
    console.log(oldViewState);
    useViewerStore.setState({
      viewState: {
        ...oldViewState,
        zoom: oldViewState.zoom + 1,
      },
    });
  }, [oldViewState, toggleDisableTiledView]);

  const handleContinue = useCallback(() => {
    handleToggleChange();
    setIsModalOpen(false);
  }, [handleToggleChange]);

  const handleClick = useCallback(() => {
    const disableModal = localStorage.getItem("disableTiledLayerWarnign_DSA");
    if (!disableTiledView && !disableModal) {
      setIsModalOpen(true);
    } else {
      handleToggleChange();
    }
  }, [disableTiledView, handleToggleChange]);

  return (
    <Box sx={sx.optionsToggleWrapper}>
      <FormControlLabel
        label="Disable tiled view"
        control={<GxSwitch checked={disableTiledView} onChange={handleClick} />}
      />
      <TranscriptLayerWarningModal
        onContinue={handleContinue}
        isOpen={isModalOpen}
        handleClose={() => setIsModalOpen(false)}
      />
    </Box>
  );
};

const sx = {
  optionsToggleWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    paddingLeft: "8px",
  },
};
