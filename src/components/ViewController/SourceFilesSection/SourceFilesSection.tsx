import { Box } from "@mui/material";
import TranscriptDropzoneButton from "./TranscriptDropzoneButton/TranscriptDropzoneButton";
import ImageDropzoneButton from "./ImageDropzoneButton/ImageDropzoneButton";
import { CellMasksDropzoneButton } from "./CellMasksDropzoneButton";

export const SourceFilesSection = () => (
  <Box sx={sx.sourceFilesSectionContainer}>
    <ImageDropzoneButton />
    <TranscriptDropzoneButton />
    <CellMasksDropzoneButton />
  </Box>
);

const sx = {
  sourceFilesSectionContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
};
