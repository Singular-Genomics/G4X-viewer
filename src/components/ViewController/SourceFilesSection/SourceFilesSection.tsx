import { Box, FormControlLabel } from "@mui/material";
import TranscriptDropzoneButton from "./TranscriptDropzoneButton/TranscriptDropzoneButton";
import ImageDropzoneButton from "./ImageDropzoneButton/ImageDropzoneButton";
import { CellMasksDropzoneButton } from "./CellMasksDropzoneButton";
import HEImageDropzoneButton from "./HEImageDropzoneButton/HEImageDropzoneButton";
import { useState } from "react";
import { GxSwitch } from "../../../shared/components/GxSwitch";
import CollectiveDropzoneButton from "./CollectiveDropzoneButton/CollectiveDropzoneButton";

export const SourceFilesSection = () => {
  const [isSingleFileMode, setIsSingleFileMode] = useState(false);
  return (
    <Box>
      <FormControlLabel
        labelPlacement="end"
        label={isSingleFileMode ? "Multi file uplaod" : "Single file upload"}
        sx={{ paddingLeft: "8px", marginBottom: "8px" }}
        control={
          <GxSwitch
            disableTouchRipple
            checked={isSingleFileMode}
            onChange={() => setIsSingleFileMode((prev) => !prev)}
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
          <HEImageDropzoneButton />
          <TranscriptDropzoneButton />
          <CellMasksDropzoneButton />
        </Box>
      )}
    </Box>
  );
};

const sx = {
  sourceFilesSectionContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
};
