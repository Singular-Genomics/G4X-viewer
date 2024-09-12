import { useShallow } from "zustand/react/shallow";
import {
  Box,
  Collapse,
  FormControlLabel,
  Theme,
  useTheme,
} from "@mui/material";
import { GxCheckbox } from "../../../../shared/components/GxCheckbox";
import { useTranscriptLayerStore } from "../../../../stores/TranscriptLayerStore";
import { GxSwitch } from "../../../../shared/components/GxSwitch";
import { useCallback, useState } from "react";
import { useViewerStore } from "../../../../stores/ViewerStore";
import { TranscriptLayerWarningModal } from "./TranscriptLayerWarningModal";

export const TranscriptLayerToggle = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [
    isTranscriptLayerOn,
    disableTiledView,
    toggleTranscriptLayer,
    toggleDisableTiledView,
  ] = useTranscriptLayerStore(
    useShallow((store) => [
      store.isTranscriptLayerOn,
      store.disableTiledView,
      store.toggleTranscriptLayer,
      store.toggleDisableTiledView,
    ])
  );

  const { viewState: oldViewState } = useViewerStore();

  const handleToggleChange = useCallback(() => {
    toggleDisableTiledView();
    useViewerStore.setState({
      viewState: {
        ...oldViewState,
        zoom: oldViewState.zoom - 0.000001,
      },
    });
  }, [oldViewState, toggleDisableTiledView]);

  const handleClick = useCallback(() => {
    const disableModal = localStorage.getItem("disableTiledLayerWarnign_DSA");
    if (!disableTiledView && !disableModal) {
      setIsModalOpen(true);
    } else {
      handleToggleChange();
    }
  }, [disableTiledView, handleToggleChange]);

  const handleContinue = useCallback(() => {
    handleToggleChange();
    setIsModalOpen(false);
  }, [handleToggleChange]);

  return (
    <>
      <Box>
        <FormControlLabel
          label="Transcript Layer"
          control={
            <GxCheckbox
              onChange={toggleTranscriptLayer}
              checked={isTranscriptLayerOn}
              disableTouchRipple
            />
          }
        />
        <Collapse in={isTranscriptLayerOn} sx={sx.subSectionWrapper}>
          <FormControlLabel
            label="Disable tiled view"
            control={
              <GxSwitch checked={disableTiledView} onChange={handleClick} />
            }
          />
        </Collapse>
      </Box>
      <TranscriptLayerWarningModal
        onContinue={handleContinue}
        isOpen={isModalOpen}
        handleClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

const styles = (theme: Theme) => ({
  subSectionWrapper: {
    marginLeft: "32px",
    borderLeft: `5px solid ${theme.palette.gx.mediumGrey[100]}`,
    paddingLeft: "8px",
  },
});
