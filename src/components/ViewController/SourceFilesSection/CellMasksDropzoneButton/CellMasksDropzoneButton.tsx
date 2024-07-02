import { Box } from "@mui/material";
import { useViewerStore } from "../../../../stores/ViewerStore"
import { GxDropzoneButton } from "../../../../shared/components/GxDropzoneButton";
import { useCellMasksFileHandler } from "./useCellMasksFileHandler";
import { useCellSegmentationLayerStore } from "../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore";

export const CellMasksDropzoneButton = () => {
  const source = useViewerStore((store) => store.source);
  const fileName = useCellSegmentationLayerStore((store) => store.fileName);
  const { getInputProps, getRootProps } = useCellMasksFileHandler();

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
    </Box>
  )
}