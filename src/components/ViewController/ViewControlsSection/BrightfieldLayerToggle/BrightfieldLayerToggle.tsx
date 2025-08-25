import { useShallow } from 'zustand/react/shallow';
import { useBrightfieldImagesStore } from '../../../../stores/BrightfieldImagesStore';
import { Box, FormControlLabel } from '@mui/material';
import { GxCheckbox } from '../../../../shared/components/GxCheckbox';
import { useTranslation } from 'react-i18next';

export const BrightfieldLayerToggle = () => {
  const { t } = useTranslation();
  const [isLayerVisible, toggleImageLayer] = useBrightfieldImagesStore(
    useShallow((store) => [store.isLayerVisible, store.toggleImageLayer])
  );

  return (
    <Box>
      <FormControlLabel
        label={t('viewSettings.brightfieldLayer')}
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
