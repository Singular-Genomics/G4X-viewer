import { Box, FormControlLabel, Typography } from "@mui/material";
import TranscriptDropzoneButton from "./TranscriptDropzoneButton/TranscriptDropzoneButton";
import ImageDropzoneButton from "./ImageDropzoneButton/ImageDropzoneButton";
import { CellMasksDropzoneButton } from "./CellMasksDropzoneButton";
import { useCallback, useState } from "react";
import { GxSwitch } from "../../../shared/components/GxSwitch";
import CollectiveDropzoneButton from "./CollectiveDropzoneButton/CollectiveDropzoneButton";
import { GxModal } from "../../../shared/components/GxModal";

export const SourceFilesSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSingleFileMode, setIsSingleFileMode] = useState(false);
  const [isSwitchLocked, setIsSwitchLocked] = useState(false);

  const toggleSingleFileUpload = useCallback(() => {
    const disableModal = localStorage.getItem(
      "disableSingleFileUploadWarning_DSA"
    );
    if (disableModal || isSingleFileMode) {
      setIsSingleFileMode((prev) => !prev);
    } else {
      setIsModalOpen(true);
    }
  }, [setIsSingleFileMode, isSingleFileMode]);

  const onContinue = useCallback(() => {
    setIsModalOpen(false);
    setIsSingleFileMode(true);
  }, []);

  const handleLockSwitch = useCallback(
    (lockState: boolean) => setIsSwitchLocked(lockState),
    []
  );

  return (
    <>
      <Box>
        <FormControlLabel
          labelPlacement="end"
          label={isSingleFileMode ? "Multi file uplaod" : "Single file upload"}
          sx={{ paddingLeft: "8px", marginBottom: "8px" }}
          control={
            <GxSwitch
              disableTouchRipple
              checked={isSingleFileMode}
              onChange={toggleSingleFileUpload}
              disabled={isSwitchLocked}
            />
          }
        />
        {isSingleFileMode ? (
          <Box>
            <CollectiveDropzoneButton setLockSwitch={handleLockSwitch} />
          </Box>
        ) : (
          <Box sx={sx.sourceFilesSectionContainer}>
            <ImageDropzoneButton />
            <TranscriptDropzoneButton setLockSwitch={handleLockSwitch} />
            <CellMasksDropzoneButton setLockSwitch={handleLockSwitch} />
          </Box>
        )}
      </Box>
      <GxModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onContinue={onContinue}
        title="Warning"
        colorVariant="singular"
        iconVariant="info"
        dontShowFlag="disableSingleFileUploadWarning_DSA"
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
