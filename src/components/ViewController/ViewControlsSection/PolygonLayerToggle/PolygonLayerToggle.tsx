import { useShallow } from 'zustand/react/shallow';
import { Box, FormControlLabel } from '@mui/material';
import { GxCheckbox } from '../../../../shared/components/GxCheckbox';
import { usePolygonDrawingStore } from '../../../../stores/PolygonDrawingStore';
import { PolygonOpacitySettings } from '../PolygonOpacitySettings';
import { useTranslation } from 'react-i18next';

export const PolygonLayerToggle = () => {
  const { t } = useTranslation();
  const [isPolygonLayerVisible, togglePolygonLayerVisibility] = usePolygonDrawingStore(
    useShallow((store) => [store.isPolygonLayerVisible, store.togglePolygonLayerVisibility])
  );

  return (
    <Box>
      <FormControlLabel
        label={t('viewSettings.polygonLayer')}
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
