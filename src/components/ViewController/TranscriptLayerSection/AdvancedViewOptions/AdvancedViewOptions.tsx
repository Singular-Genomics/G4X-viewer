import { useCallback, useState } from 'react';
import { Box, FormControlLabel, Typography } from '@mui/material';
import { GxSwitch } from '../../../../shared/components/GxSwitch';
import { MaxLayerSlider } from './MaxLayerSlider';
import { useTranscriptLayerStore } from '../../../../stores/TranscriptLayerStore';
import { useShallow } from 'zustand/react/shallow';
import { triggerViewerRerender } from './AdvancedViewOptions.helpers';
import { GxModal } from '../../../../shared/components/GxModal';
import { useTranslation } from 'react-i18next';

export const AdvancedViewOptions = () => {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [overrideLayers, toggleOverrideLayer] = useTranscriptLayerStore(
    useShallow((store) => [store.overrideLayers, store.toggleOverrideLayer])
  );

  const toggleLayerControls = useCallback(() => {
    const disableModal = localStorage.getItem('disableTiledLayerWarning_DSA');
    if (disableModal || overrideLayers) {
      toggleOverrideLayer();
      triggerViewerRerender();
    } else {
      setIsModalOpen(true);
    }
  }, [toggleOverrideLayer, overrideLayers]);

  const onContinue = useCallback(() => {
    setIsModalOpen(false);
    triggerViewerRerender();
    useTranscriptLayerStore.setState({ overrideLayers: true });
  }, []);

  return (
    <>
      <Box sx={sx.optionsToggleWrapper}>
        <FormControlLabel
          label={t('transcriptsSettings.subsamplingControlLabel')}
          control={
            <GxSwitch
              checked={overrideLayers}
              onChange={toggleLayerControls}
            />
          }
        />
        <MaxLayerSlider disabled={!overrideLayers} />
      </Box>
      <GxModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onContinue={onContinue}
        title={t('general.warning')}
        colorVariant="danger"
        iconVariant="danger"
        dontShowFlag="disableTiledLayerWarning_DSA"
      >
        <Typography sx={sx.modalContentText}>{t('transcriptsSettings.subsamplingControlWarning')}</Typography>
        <Typography
          component={'span'}
          sx={sx.modalContentText}
        >
          <ul>
            <li>{t('transcriptsSettings.subsamplingControlWarning_caseOne')}</li>
            <li>{t('transcriptsSettings.subsamplingControlWarning_caseTwo')}</li>
          </ul>
        </Typography>
      </GxModal>
    </>
  );
};

const sx = {
  optionsToggleWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingLeft: '8px'
  },
  modalContentText: {
    fontWeight: 'bold'
  }
};
