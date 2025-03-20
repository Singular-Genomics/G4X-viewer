import { alpha, Box, LinearProgress, Theme, useTheme } from "@mui/material";
import { GxDropzoneButton } from "../../../../shared/components/GxDropzoneButton";
import { useFileHandler } from "./helpers/useFileHandler";
import { CollectiveDropzoneButtonProps } from "./CollectiveDropzoneButton.types";
import { useEffect } from "react";

export default function CollectiveDropzoneButton({
  setLockSwitch,
}: CollectiveDropzoneButtonProps) {
  const theme = useTheme();
  const sx = styles(theme);

  const { dropzoneProps, loading, progress, collectiveFileName } =
    useFileHandler();

  useEffect(() => {
    setLockSwitch(loading);
  }, [loading, setLockSwitch]);

  return (
    <Box>
      <GxDropzoneButton
        labelTitle="Collective file upload"
        buttonText="Upload G4X file"
        labelText={collectiveFileName}
        {...dropzoneProps}
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
