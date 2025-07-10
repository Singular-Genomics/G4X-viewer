import { useCallback, useState } from 'react';
import { Box, FormControlLabel, Typography } from '@mui/material';
import { GxSwitch } from '../../../../shared/components/GxSwitch';
import { MaxLayerSlider } from './MaxLayerSlider';
import { useTranscriptLayerStore } from '../../../../stores/TranscriptLayerStore';
import { useShallow } from 'zustand/react/shallow';
import { triggerViewerRerender } from './AdvancedViewOptions.helpers';
import { GxModal } from '../../../../shared/components/GxModal';
import { useBinaryFilesStore } from '../../../../stores/BinaryFilesStore';

export const AdvancedViewOptions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [overrideLayers, toggleOverrideLayer] = useTranscriptLayerStore(
    useShallow((store) => [store.overrideLayers, store.toggleOverrideLayer])
  );
  const { layers } = useBinaryFilesStore((store) => store.layerConfig);

  const toggleLayerControls = useCallback(() => {
    const disableModal = localStorage.getItem('disableTiledLayerWarning_DSA');
    if (disableModal || overrideLayers) {
      toggleOverrideLayer();
      // Reset maxVisibleLayers
      if (overrideLayers) {
        useTranscriptLayerStore.setState({ maxVisibleLayers: layers });
      }
      triggerViewerRerender();
    } else {
      setIsModalOpen(true);
    }
  }, [toggleOverrideLayer, overrideLayers, layers]);

  const onContinue = useCallback(() => {
    setIsModalOpen(false);
    triggerViewerRerender();
    useTranscriptLayerStore.setState({ overrideLayers: true });
  }, []);

  return (
    <>
      <Box sx={sx.optionsToggleWrapper}>
        <FormControlLabel
          label="Enable layers controls"
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
        title="Warning"
        colorVariant="danger"
        iconVariant="danger"
        dontShowFlag="disableTiledLayerWarning_DSA"
      >
        <Typography sx={sx.modalContentText}>
          You are about to override the number of visible transcript layers.
          <br />
          These operations demand significant computational resources and might cause the application to crash. Perform
          these operations if:
        </Typography>
        <Typography
          component={'span'}
          sx={sx.modalContentText}
        >
          <ul>
            <li>
              Your PC is equiped with high-end components (mainly GPU and CPU) and allows for hardwere acceleration.
            </li>
            <li>Your transcript dataset contains less than 5 million points.</li>
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
