import { Box } from "@mui/material";
import TranscriptDropzoneButton from "./TranscriptDropzoneButton/TranscriptDropzoneButton";
import ImageDropzoneButton from "./ImageDropzoneButton/ImageDropzoneButton";
import { CellMasksDropzoneButton } from "./CellMasksDropzoneButton";
import HEImageDropzoneButton from "./HEImageDropzoneButton/HEImageDropzoneButton";
import GeneralDetailsDropzoneButton from "./GeneralDetailsDropzoneButton/GeneralDetailsDropzoneButton";

export const SourceFilesSection = () => (
  <Box sx={sx.sourceFilesSectionContainer}>
    <ImageDropzoneButton />
    <GeneralDetailsDropzoneButton />
    <HEImageDropzoneButton />
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
