import { useShallow } from "zustand/react/shallow";
import {
  Box,
  Collapse,
  FormControlLabel,
  Theme,
  useTheme,
} from "@mui/material";
import { GxCheckbox } from "../../../../shared/components/GxCheckbox";
import { useMetadataLayerStore } from "../../../../stores/MetadataLayerStore";
import { GxSwitch } from "../../../../shared/components/GxSwitch";
import { useCallback, useState } from "react";
import { useViewerStore } from "../../../../stores/ViewerStore";
import { MetadataLayerWarnignModal } from "./MetadataLayerWarnignModal";

export const MetadataLayerToggle = () => {
  const theme = useTheme();
  const sx = styles(theme);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [
    isMetadataLayerOn,
    disableTiledView,
    toggleMetadataLayer,
    toggleDisableTiledView,
  ] = useMetadataLayerStore(
    useShallow((store) => [
      store.isMetadataLayerOn,
      store.disableTiledView,
      store.toggleMetadataLayer,
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
          label="Metadata Layer"
          control={
            <GxCheckbox
              onChange={toggleMetadataLayer}
              checked={isMetadataLayerOn}
              disableTouchRipple
            />
          }
        />
        <Collapse in={isMetadataLayerOn} sx={sx.subSectionWrapper}>
          <FormControlLabel
            label="Disable tiled view"
            control={
              <GxSwitch checked={disableTiledView} onChange={handleClick} />
            }
          />
        </Collapse>
      </Box>
      <MetadataLayerWarnignModal
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
