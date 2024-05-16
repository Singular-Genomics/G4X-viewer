import {
  Button,
  Dialog,
  DialogContent,
  LinearProgress,
  TextField,
  Typography,
  Box
} from "@mui/material";
import { useFileHandler } from "./useFileHandler";
import { useBinaryFilesStore } from "../../../../stores/BinaryFilesStore";

export default function BinaryDropzoneButton() {
  const { getRootProps, getInputProps, loading, progress } = useFileHandler();
  const fileName = useBinaryFilesStore(store => store.fileName);

  return (
    <Box>
      <TextField
        variant="filled"
        label="Transcript File Name"
        size="small"
        fullWidth
        inputProps={{ readOnly: true }}
        value={fileName || " "}
        sx={sx.textField}
      />
      <Button
        fullWidth
        variant="outlined"
        sx={sx.dropDownButton}
        size="small"
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        Upload points file
      </Button>
      <Dialog open={loading}>
        <DialogContent>
          <LinearProgress
            sx={sx.progressBar}
            variant="determinate"
            value={progress}
          />
          <Typography sx={sx.loadingText} variant="h2">
            Loading and unpacking files... ({progress}%)
          </Typography>
        </DialogContent>
      </Dialog>
    </Box>
  );
}

const sx = {
  textField: {
    marginBottom: '8px',
    '& .MuiFormLabel-root.Mui-focused': {
      color: "rgba(0, 177, 164, 1)",
    },
    '& .MuiInputBase-root::after': {
      borderBottom: '2px solid rgba(0, 177, 164, 1)',
    }
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
