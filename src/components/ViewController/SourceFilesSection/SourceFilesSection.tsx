import { Box } from "@mui/material";
import BinaryDropzoneButton from "./BinaryDropzoneButton/BinaryDropzoneButton";
import ImageDropzoneButton from "./ImageDropzoneButton/ImageDropzoneButton";

export const SourceFilesSection = () => (
  <Box sx={sx.sourceFilesSectionContainer}>
    <ImageDropzoneButton />
    <BinaryDropzoneButton />
  </Box>
);

const sx = {
  sourceFilesSectionContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
};
