import { useShallow } from 'zustand/react/shallow';
import { useBrightfieldImagesStore } from '../../../../stores/BrightfieldImagesStore';
import { Box, FormControlLabel } from '@mui/material';
import { GxCheckbox } from '../../../../shared/components/GxCheckbox';

export const BrightfieldLayerToggle = () => {
  const [isLayerVisible, toggleImageLayer] = useBrightfieldImagesStore(
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
