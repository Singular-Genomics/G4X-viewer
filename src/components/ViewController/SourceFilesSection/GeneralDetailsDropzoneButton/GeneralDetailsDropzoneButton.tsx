import { Box } from "@mui/material";
import { useViewerStore } from "../../../../stores/ViewerStore";
import { GxDropzoneButton } from "../../../../shared/components/GxDropzoneButton";
import { useGeneralDetailsHandler } from "./useGeneralDetailsButtonHandler";

export default function GeneralDetailsDropzoneButton() {
  const { getRootProps, getInputProps } = useGeneralDetailsHandler();
  const isDisabled = !useViewerStore((store) => store.source?.description);
  const detailsName = useViewerStore((store) => store.generalDetails?.fileName);

  return (
    <Box>
      <GxDropzoneButton
        getRootProps={getRootProps}
        getInputProps={getInputProps}
        labelTitle="General Details File"
        labelText={detailsName}
        buttonText="Upload general details"
        disabled={isDisabled}
      />
    </Box>
  );
}
