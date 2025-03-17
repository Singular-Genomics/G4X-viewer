import { Box } from "@mui/material";
import { useViewerStore } from "../../../../stores/ViewerStore";
import { GxDropzoneButton } from "../../../../shared/components/GxDropzoneButton";
import { useGeneralDetailsHandler } from "./useGeneralDetailsButtonHandler";

export default function GeneralDetailsDropzoneButton() {
  const dropzoneProps = useGeneralDetailsHandler();
  const isDisabled = !useViewerStore((store) => store.source?.description);
  const detailsName = useViewerStore((store) => store.generalDetails?.fileName);

  return (
    <Box>
      <GxDropzoneButton
        labelTitle="General Details File"
        labelText={detailsName}
        buttonText="Upload general details"
        disabled={isDisabled}
        {...dropzoneProps}
      />
    </Box>
  );
}
