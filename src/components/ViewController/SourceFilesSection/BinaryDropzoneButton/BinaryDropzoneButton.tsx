import {
  LinearProgress,
  Box,
} from "@mui/material";
import { useFileHandler } from "./useFileHandler";
import { useBinaryFilesStore } from "../../../../stores/BinaryFilesStore";
import { DropzoneButton } from "../DropzoneButton/DropzoneButton";
import { useViewerStore } from "../../../../stores/ViewerStore";

export default function BinaryDropzoneButton() {
  const { getRootProps, getInputProps, loading, progress } = useFileHandler();
  const fileName = useBinaryFilesStore((store) => store.fileName);
  const source = useViewerStore((store) => store.source);

  return (
    <Box>
      <DropzoneButton
        getRootProps={getRootProps}
        getInputProps={getInputProps}
        labelTitle="Transcript File Name"
        labelText={fileName}
        buttonText="Upload points file"
        disabled={!source}
      />
      {loading && (
        <LinearProgress
          sx={sx.progressBar}
          variant="determinate"
          value={progress}
        />
      )}
    </Box>
  );
}

const sx = {
  textField: {
    marginBottom: "8px",
    "& .MuiFormLabel-root.Mui-focused": {
      color: "rgba(0, 177, 164, 1)",
    },
    "& .MuiInputBase-input": {
      cursor: "auto",
    },
    "& .MuiInputBase-root::after": {
      borderBottom: "2px solid rgba(0, 177, 164, 1)",
    },
  },
  dropDownButton: {
    borderStyle: "dashed",
    width: "100%",
    height: "40px",
    borderColor: "rgba(0, 177, 164, 1)",
    color: "rgba(0, 177, 164, 1)",
    "&:hover": {
      borderColor: "rgba(0, 177, 164, 1)",
      backgroundColor: "rgba(0, 177, 164, 0.2)",
    },
  },
  progressBar: {
    "& .MuiLinearProgress-barColorPrimary": {
      backgroundColor: "rgba(0, 177, 164, 1) !important",
    },
    "&.MuiLinearProgress-root": {
      backgroundColor: "rgba(0, 177, 164, 0.2) !important",
    },
  },
  loadingText: {
    marginTop: "16px",
    fontSize: "16px",
    fontWeight: 500,
  },
};
