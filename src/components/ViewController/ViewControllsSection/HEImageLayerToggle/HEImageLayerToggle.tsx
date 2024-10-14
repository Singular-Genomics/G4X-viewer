import { useShallow } from "zustand/react/shallow";
import { useHEImageStore } from "../../../../stores/HEImageStore";
import { FormControlLabel } from "@mui/material";
import { GxCheckbox } from "../../../../shared/components/GxCheckbox";

export const HEImageLayerToggle = () => {
  const [isLayerVisible, toggleImageLayer] = useHEImageStore(
    useShallow((store) => [store.isLayerVisible, store.toggleImageLayer])
  );

  return (
    <FormControlLabel
      label="H&E Image Layer"
      control={
        <GxCheckbox
          onChange={toggleImageLayer}
          checked={isLayerVisible}
          disableTouchRipple
        />
      }
    />
  );
};
