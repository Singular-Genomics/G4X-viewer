import { alpha, Box, LinearProgress, Theme, useTheme } from "@mui/material";
import { useViewerStore } from "../../../../stores/ViewerStore";
import { GxDropzoneButton } from "../../../../shared/components/GxDropzoneButton";
import { useCellMasksFileHandler } from "./useCellMasksFileHandler";
import { useCellSegmentationLayerStore } from "../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore";

export const CellMasksDropzoneButton = () => {
  const theme = useTheme();
  const sx = styles(theme);
  
  const source = useViewerStore((store) => store.source);
  const fileName = useCellSegmentationLayerStore((store) => store.fileName);
  const { getInputProps, getRootProps, loading, progress } =
    useCellMasksFileHandler();

  return (
    <Box>
      <GxDropzoneButton
        getRootProps={getRootProps}
        getInputProps={getInputProps}
        labelTitle="Cell Transcript File Name"
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
