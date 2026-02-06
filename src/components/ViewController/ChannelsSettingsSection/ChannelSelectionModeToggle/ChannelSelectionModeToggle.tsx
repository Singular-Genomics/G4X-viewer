import { FormControlLabel } from '@mui/material';
import { useChannelsStore } from '../../../../stores/ChannelsStore';
import { useShallow } from 'zustand/react/shallow';
import { GxCheckbox } from '../../../../shared/components/GxCheckbox';
import { useTranslation } from 'react-i18next';

export const ChannelSelectionModeToggle = () => {
  const { t } = useTranslation();
  const [channelSelectionMode, setChannelSelectionMode] = useChannelsStore(
    useShallow((store) => [store.channelSelectionMode, store.setChannelSelectionMode])
  );

  const handleToggle = () => {
    const newMode = channelSelectionMode === 'multiselect' ? 'radio' : 'multiselect';
    setChannelSelectionMode(newMode);
  };

  return (
    <FormControlLabel
      label={t('channelSettings.singleChannelMode')}
      control={
        <GxCheckbox
          onChange={handleToggle}
          checked={channelSelectionMode === 'radio'}
          disableTouchRipple
        />
      }
    />
  );
};
