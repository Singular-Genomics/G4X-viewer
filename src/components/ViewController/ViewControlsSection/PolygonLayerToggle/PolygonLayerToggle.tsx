import { useShallow } from 'zustand/react/shallow';
import { Box, FormControlLabel } from '@mui/material';
import { GxCheckbox } from '../../../../shared/components/GxCheckbox';
import { usePolygonDrawingStore } from '../../../../stores/PolygonDrawingStore';
import { PolygonOpacitySettings } from '../PolygonOpacitySettings';

export const PolygonLayerToggle = () => {
  const [isPolygonLayerVisible, togglePolygonLayerVisibility] = usePolygonDrawingStore(
    useShallow((store) => [store.isPolygonLayerVisible, store.togglePolygonLayerVisibility])
  );

  return (
    <Box>
      <FormControlLabel
        label="ROI Polygons"
        control={
          <GxCheckbox
            onChange={togglePolygonLayerVisibility}
            checked={isPolygonLayerVisible}
            disableTouchRipple
          />
        }
      />
      {isPolygonLayerVisible && <PolygonOpacitySettings />}
    </Box>
  );
};
