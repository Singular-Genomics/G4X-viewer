import { useShallow } from 'zustand/react/shallow';
import { FormControlLabel } from '@mui/material';
import { GxCheckbox } from '../../../../shared/components/GxCheckbox';
import { usePolygonDrawingStore } from '../../../../stores/PolygonDrawingStore';

export const PolygonLayerToggle = () => {
  const [isPolygonLayerVisible, togglePolygonLayerVisibility] = usePolygonDrawingStore(
    useShallow((store) => [store.isPolygonLayerVisible, store.togglePolygonLayerVisibility])
  );

  return (
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
  );
};
