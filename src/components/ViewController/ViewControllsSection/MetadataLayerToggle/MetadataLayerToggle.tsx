import { useShallow } from "zustand/react/shallow";
import { FormControlLabel } from "@mui/material";
import { GxCheckbox } from "../../../../shared/components/GxCheckbox";
import { useMetadataLayerStore } from "../../../../stores/MetadataLayerStore";

export const MetadataLayerToggle = () => {
  const [isMetadataLayerOn, toggleMetadataLayer] = useMetadataLayerStore(
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
