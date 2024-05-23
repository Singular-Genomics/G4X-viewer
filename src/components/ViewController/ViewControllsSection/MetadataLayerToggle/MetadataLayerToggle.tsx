import { useShallow } from "zustand/react/shallow";
import { useViewerStore } from "../../../../stores/ViewerStore";
import { FormControlLabel } from "@mui/material";
import { GxCheckbox } from "../../../../shared/components/GxCheckbox";

export const MetadataLayerToggle = () => {
  const [isMetadataLayerOn, toggleMetadataLayer] = useViewerStore(
    useShallow((store) => [store.isMetadataLayerOn, store.toggleMetadataLayer])
  );

  return (
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
  );
};
