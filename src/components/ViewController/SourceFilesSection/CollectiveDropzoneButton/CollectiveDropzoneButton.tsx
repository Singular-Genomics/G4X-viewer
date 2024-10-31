import { alpha, Box, LinearProgress, Theme, useTheme } from "@mui/material";
import { GxDropzoneButton } from "../../../../shared/components/GxDropzoneButton";
import { useFileHandler } from "./helpers/useFileHandler";

export default function CollectiveDropzoneButton() {
  const theme = useTheme();
  const sx = styles(theme);
  const { getInputProps, getRootProps, loading, progress, collectiveFileName } =
    useFileHandler();

  return (
    <Box>
      <GxDropzoneButton
        getInputProps={getInputProps}
        getRootProps={getRootProps}
        labelTitle="Collective file upload"
        buttonText="Upload G4X file"
        labelText={collectiveFileName}
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
