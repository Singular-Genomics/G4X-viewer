import { alpha, Box, LinearProgress, Theme, useTheme } from "@mui/material";
import { useViewerStore } from "../../../../stores/ViewerStore";
import { GxDropzoneButton } from "../../../../shared/components/GxDropzoneButton";
import { useCellMasksFileHandler } from "./helpers/useCellMasksFileHandler";
import { useCellSegmentationLayerStore } from "../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore";
import { CellMasksDropzoneButtonProps } from "./CellMasksDropzoneButton.types";
import { useEffect } from "react";

export const CellMasksDropzoneButton = ({
  setLockSwitch,
}: CellMasksDropzoneButtonProps) => {
  const theme = useTheme();
  const sx = styles(theme);

  const source = useViewerStore((store) => store.source);
  const fileName = useCellSegmentationLayerStore((store) => store.fileName);
  const { getInputProps, getRootProps, loading, progress } =
    useCellMasksFileHandler();

  useEffect(() => setLockSwitch(loading), [setLockSwitch, loading]);

  return (
    <Box>
      <GxDropzoneButton
        getRootProps={getRootProps}
        getInputProps={getInputProps}
        labelTitle="Cell Masks File Name"
        labelText={fileName}
        buttonText="Upload cells masks"
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
};

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
