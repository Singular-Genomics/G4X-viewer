import { useCallback, useState } from "react";
import { TranscriptLayerWarningModal } from "./TranscriptLayerWarningModal";
import { Box, FormControlLabel } from "@mui/material";
import { GxSwitch } from "../../../../shared/components/GxSwitch";
import { MaxLayerSlider } from "./MaxLayerSlider";
import { DisableLayersSwitch } from "./DisableLayersSwitch/DisableLayersSwitch";
import { useTranscriptLayerStore } from "../../../../stores/TranscriptLayerStore";
import { useShallow } from "zustand/react/shallow";
import { triggerViewerRerender } from "./AdvancedViewOptions.helpers";

export const AdvancedViewOptions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [overrideLayers, toggleOverrideLayer] = useTranscriptLayerStore(
    useShallow((store) => [store.overrideLayers, store.toggleOverrideLayer])
  );

  const toggleLayerControls = useCallback(() => {
    const disableModal = localStorage.getItem("disableTiledLayerWarnign_DSA");
    if (disableModal || overrideLayers) {
      toggleOverrideLayer();
      triggerViewerRerender();
    } else {
      setIsModalOpen(true);
    }
  }, [toggleOverrideLayer, overrideLayers]);

  const onContinue = useCallback(() => {
    setIsModalOpen(false);
    triggerViewerRerender();
    useTranscriptLayerStore.setState({ overrideLayers: true });
  }, []);

  return (
    <>
      <Box sx={sx.optionsToggleWrapper}>
        <FormControlLabel
          label="Enable layers controls"
          control={
            <GxSwitch checked={overrideLayers} onChange={toggleLayerControls} />
          }
        />
        <DisableLayersSwitch disabled={!overrideLayers} />
        <MaxLayerSlider disabled={!overrideLayers} />
      </Box>
      <TranscriptLayerWarningModal
        onContinue={onContinue}
        isOpen={isModalOpen}
        handleClose={() => setIsModalOpen(false)}
      />
    </>
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
