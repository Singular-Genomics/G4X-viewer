import { Box, Typography } from "@mui/material";
import TranscriptDropzoneButton from "./TranscriptDropzoneButton/TranscriptDropzoneButton";
import ImageDropzoneButton from "./ImageDropzoneButton/ImageDropzoneButton";
import { CellMasksDropzoneButton } from "./CellMasksDropzoneButton";
import { useCallback, useState } from "react";
import CollectiveDropzoneButton from "./CollectiveDropzoneButton/CollectiveDropzoneButton";
import { UploadSelectSwitch } from "./UploadSelectSwitch/UploadSelectSwitch";
import {
  UploadMode,
  UPLOAD_MODES,
} from "./UploadSelectSwitch/UploadSelectSwitch.types";
import { GxModal } from "../../../shared/components/GxModal";
import GeneralDetailsDropzoneButton from "./GeneralDetailsDropzoneButton/GeneralDetailsDropzoneButton";

const DONT_SHOW_FLAG = "disableSingleFileUploadWarning_DSA";

export const SourceFilesSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSwitchLocked, setIsSwitchLocked] = useState(false);
  const [uploadMode, setUploadMode] = useState<UploadMode>(
    UPLOAD_MODES.MULTI_FILE
  );

  const onContinue = useCallback(() => {
    setIsModalOpen(false);
    setUploadMode(UPLOAD_MODES.SINGLE_FILE);
  }, []);

  const handleLockSwitch = useCallback(
    (lockState: boolean) => setIsSwitchLocked(lockState),
    []
  );

  const handleModeChange = useCallback((uploadMode: UploadMode) => {
    const disableModal = localStorage.getItem(DONT_SHOW_FLAG);

    if (!disableModal && uploadMode === UPLOAD_MODES.SINGLE_FILE) {
      setIsModalOpen(true);
      return;
    }
    setUploadMode(uploadMode);
  }, []);

  const getUploadComponents = useCallback((uploadMode: UploadMode) => {
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
  }, []);

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
        title="Warning"
        colorVariant="singular"
        iconVariant="info"
        dontShowFlag={DONT_SHOW_FLAG}
      >
        <Typography sx={sx.modalContentText}>
          You are about use a collective TAR file upload button.
        </Typography>
        <Typography sx={sx.modalContentText}>
          When working using this mode, remember that this option may require
          significantly more time to load all the contents, depending on their
          size.
        </Typography>
      </GxModal>
    </>
  );
};

const sx = {
  sourceFilesSectionContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  modalContentText: {
    fontWeight: "bold",
  },
};
