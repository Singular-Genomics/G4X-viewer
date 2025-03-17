import { Box } from "@mui/material";
import { GxDropzoneButton } from "../../../../shared/components/GxDropzoneButton";
import { useHEImageHandler } from "./useHEImageDropzoneButton";
import { useHEImageStore } from "../../../../stores/HEImageStore";

export default function HEImageDropzoneButton() {
  const dropzoneProps = useHEImageHandler();
  const imageName = useHEImageStore(
    (store) => store.heImageSource?.description
  );

  return (
    <Box>
      <GxDropzoneButton
        labelTitle="H&E Image File Name"
        labelText={imageName}
        buttonText="H&E Upload image file"
        {...dropzoneProps}
      />
    </Box>
  );
}
