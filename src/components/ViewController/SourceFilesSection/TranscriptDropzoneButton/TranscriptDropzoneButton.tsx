import { LinearProgress, Box, Theme, alpha, useTheme } from "@mui/material";
import { useFileHandler } from "./useFileHandler";
import { useBinaryFilesStore } from "../../../../stores/BinaryFilesStore";
import { GxDropzoneButton } from "../../../../shared/components/GxDropzoneButton/GxDropzoneButton";
import { useViewerStore } from "../../../../stores/ViewerStore";

export default function TranscriptDropzoneButton() {
  const theme = useTheme();
  const sx = styles(theme);
  const { getRootProps, getInputProps, loading, progress } = useFileHandler();
  const fileName = useBinaryFilesStore((store) => store.fileName);
  const source = useViewerStore((store) => store.source);

  return (
    <Box>
      <GxDropzoneButton
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
      backgroundColor: `${alpha(
        theme.palette.gx.accent.greenBlue,
        0.2
      )} !important`,
    },
  },
});
