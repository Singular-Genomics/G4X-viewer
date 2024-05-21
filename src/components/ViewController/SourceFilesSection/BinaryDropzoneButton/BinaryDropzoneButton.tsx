import {
  LinearProgress,
  Box,
  Theme,
  alpha,
  useTheme,
} from "@mui/material";
import { useFileHandler } from "./useFileHandler";
import { useBinaryFilesStore } from "../../../../stores/BinaryFilesStore";
import { DropzoneButton } from "../DropzoneButton/DropzoneButton";
import { useViewerStore } from "../../../../stores/ViewerStore";

export default function BinaryDropzoneButton() {
  const theme = useTheme();
  const sx = styles(theme);
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

const styles = (theme: Theme) => ({
  progressBar: {
    "& .MuiLinearProgress-barColorPrimary": {
      backgroundColor: `${theme.palette.gx.accent.greenBlue} !important`,
    },
    "&.MuiLinearProgress-root": {
      backgroundColor: `${alpha(theme.palette.gx.accent.greenBlue, 0.2)} !important`,
    },
  },
  loadingText: {
    marginTop: "16px",
    fontSize: "16px",
    fontWeight: 500,
  },
});
