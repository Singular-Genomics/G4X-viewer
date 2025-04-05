import { FormControlLabel } from '@mui/material';
import { useViewerStore } from '../../../../stores/ViewerStore/ViewerStore';
import { useShallow } from 'zustand/react/shallow';
import { GxCheckbox } from '../../../../shared/components/GxCheckbox';

export const OverviewToggle = () => {
  const [isOverviewOn, toggleOverview] = useViewerStore(
    useShallow((store) => [store.isOverviewOn, store.toggleOverview])
  );

  return (
    <FormControlLabel
      label="Overview"
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
