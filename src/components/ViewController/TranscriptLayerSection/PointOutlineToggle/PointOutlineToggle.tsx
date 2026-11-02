import { Box, FormControlLabel } from '@mui/material';
import { useShallow } from 'zustand/react/shallow';
import { useTranslation } from 'react-i18next';
import { GxSwitch } from '../../../../shared/components/GxSwitch';
import { useTranscriptSource } from '../TranscriptSourceContext';

export const PointOutlineToggle = () => {
  const { t } = useTranslation();
  const { useLayerStore } = useTranscriptSource();
  const [showPointOutline, togglePointOutline] = useLayerStore(
    useShallow((store) => [store.showPointOutline, store.togglePointOutline])
  );

  return (
    <Box sx={sx.wrapper}>
      <FormControlLabel
        label={t('transcriptsSettings.pointOutlineLabel')}
        control={
          <GxSwitch
            checked={showPointOutline}
            onChange={togglePointOutline}
          />
        }
      />
    </Box>
  );
};

const sx = {
  wrapper: {
    paddingLeft: '8px'
  }
};
