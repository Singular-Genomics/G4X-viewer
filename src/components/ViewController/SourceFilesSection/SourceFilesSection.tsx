import { Box, Typography } from '@mui/material';
import TranscriptDropzoneButton from './TranscriptDropzoneButton/TranscriptDropzoneButton';
import ImageDropzoneButton from './ImageDropzoneButton/ImageDropzoneButton';
import { CellMasksDropzoneButton } from './CellMasksDropzoneButton';
import { useCallback, useState } from 'react';
import CollectiveDropzoneButton from './CollectiveDropzoneButton/CollectiveDropzoneButton';
import { UploadSelectSwitch } from './UploadSelectSwitch/UploadSelectSwitch';
import { UploadMode, UPLOAD_MODES } from './UploadSelectSwitch/UploadSelectSwitch.types';
import { GxModal } from '../../../shared/components/GxModal';
import GeneralDetailsDropzoneButton from './GeneralDetailsDropzoneButton/GeneralDetailsDropzoneButton';
import { useTranslation } from 'react-i18next';

const DONT_SHOW_FLAG = 'disableSingleFileUploadWarning_DSA';

export const SourceFilesSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSwitchLocked, setIsSwitchLocked] = useState(false);
  const [uploadMode, setUploadMode] = useState<UploadMode>(UPLOAD_MODES.MULTI_FILE);
  const { t } = useTranslation();

  const onContinue = useCallback(() => {
    setIsModalOpen(false);
    setUploadMode(UPLOAD_MODES.SINGLE_FILE);
  }, []);

  const handleLockSwitch = useCallback((lockState: boolean) => setIsSwitchLocked(lockState), []);

  const handleModeChange = useCallback((uploadMode: UploadMode) => {
    const disableModal = localStorage.getItem(DONT_SHOW_FLAG);

    if (!disableModal && uploadMode === UPLOAD_MODES.SINGLE_FILE) {
      setIsModalOpen(true);
      return;
    }
    setUploadMode(uploadMode);
  }, []);

  const getUploadComponents = useCallback(
    (uploadMode: UploadMode) => {
      switch (uploadMode) {
        case UPLOAD_MODES.MULTI_FILE:
          return (
            <Box sx={sx.sourceFilesSectionContainer}>
              <ImageDropzoneButton />
              <GeneralDetailsDropzoneButton />
              <TranscriptDropzoneButton setLockSwitch={handleLockSwitch} />
              <CellMasksDropzoneButton setLockSwitch={handleLockSwitch} />
            </Box>
          );
        case UPLOAD_MODES.SINGLE_FILE:
          return (
            <Box>
              <CollectiveDropzoneButton setLockSwitch={handleLockSwitch} />
            </Box>
          );
        default:
          return null;
      }
    },
    [handleLockSwitch]
  );

  return (
    <>
      <Box>
        <UploadSelectSwitch
          uploadMode={uploadMode}
          onUploadModeChange={handleModeChange}
          disabled={isSwitchLocked}
        />
        {getUploadComponents(uploadMode)}
      </Box>
      <GxModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onContinue={onContinue}
        title={t('general.warning')}
        colorVariant="singular"
        iconVariant="info"
        dontShowFlag={DONT_SHOW_FLAG}
      >
        <Typography sx={sx.modalContentText}>{t('sourceFiles.collectiveWarningTitle')}</Typography>
        <Typography sx={sx.modalContentText}>{t('sourceFiles.collectiveWarningDescription')}</Typography>
      </GxModal>
    </>
  );
};

const sx = {
  sourceFilesSectionContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  modalContentText: {
    fontWeight: 'bold'
  }
};
