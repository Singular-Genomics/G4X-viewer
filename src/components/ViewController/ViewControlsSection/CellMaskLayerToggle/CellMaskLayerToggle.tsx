import { useShallow } from 'zustand/react/shallow';
import { useCellSegmentationLayerStore } from '../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore';
import { FormControlLabel } from '@mui/material';
import { GxCheckbox } from '../../../../shared/components/GxCheckbox';
import { useTranslation } from 'react-i18next';

export const CellMaskLayerToggle = () => {
  const { t } = useTranslation();
  const [isCellLayerOn, toggleCellLayer] = useCellSegmentationLayerStore(
    useShallow((store) => [store.isCellLayerOn, store.toggleCellLayer])
  );

  return (
    <FormControlLabel
      label={t('viewSettings.segmentationLayer')}
      control={
        <GxCheckbox
          onChange={toggleCellLayer}
          checked={isCellLayerOn}
          disableTouchRipple
        />
      }
    />
  );
};
