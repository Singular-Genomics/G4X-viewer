import { useShallow } from "zustand/react/shallow";
import { useHEImagesStore } from "../../../../stores/HEImagesStore";
import { Box, FormControlLabel } from "@mui/material";
import { GxCheckbox } from "../../../../shared/components/GxCheckbox";

export const HEImageLayerToggle = () => {
  const [isLayerVisible, toggleImageLayer] = useHEImagesStore(
    useShallow((store) => [store.isLayerVisible, store.toggleImageLayer])
  );

  return (
    <Box>
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
    </Box>
  );
};
