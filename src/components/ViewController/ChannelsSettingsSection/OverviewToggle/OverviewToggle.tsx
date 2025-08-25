import { FormControlLabel } from '@mui/material';
import { useViewerStore } from '../../../../stores/ViewerStore/ViewerStore';
import { useShallow } from 'zustand/react/shallow';
import { GxCheckbox } from '../../../../shared/components/GxCheckbox';
import { useTranslation } from 'react-i18next';

export const OverviewToggle = () => {
  const { t } = useTranslation();
  const [isOverviewOn, toggleOverview] = useViewerStore(
    useShallow((store) => [store.isOverviewOn, store.toggleOverview])
  );

  return (
    <FormControlLabel
      label={t('channelSettings.overview')}
      control={
        <GxCheckbox
          onChange={toggleOverview}
          checked={isOverviewOn}
          disableTouchRipple
        />
      }
    />
  );
};
