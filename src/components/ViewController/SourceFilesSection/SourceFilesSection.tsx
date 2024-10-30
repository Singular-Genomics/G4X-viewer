import { Box, FormControlLabel } from "@mui/material";
import TranscriptDropzoneButton from "./TranscriptDropzoneButton/TranscriptDropzoneButton";
import ImageDropzoneButton from "./ImageDropzoneButton/ImageDropzoneButton";
import { CellMasksDropzoneButton } from "./CellMasksDropzoneButton";
import { useCallback, useState } from "react";
import { GxSwitch } from "../../../shared/components/GxSwitch";
import CollectiveDropzoneButton from "./CollectiveDropzoneButton/CollectiveDropzoneButton";
import { WarningModal } from "./WarningModal";

export const SourceFilesSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSingleFileMode, setIsSingleFileMode] = useState(false);

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
            />
          }
        />
        {isSingleFileMode ? (
          <Box>
            <CollectiveDropzoneButton />
          </Box>
        ) : (
          <Box sx={sx.sourceFilesSectionContainer}>
            <ImageDropzoneButton />
            <TranscriptDropzoneButton />
            <CellMasksDropzoneButton />
          </Box>
        )}
      </Box>
      <WarningModal
        onContinue={onContinue}
        isOpen={isModalOpen}
        handleClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

const sx = {
  sourceFilesSectionContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
};
