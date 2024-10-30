import { Box } from "@mui/material";
import { GxDropzoneButton } from "../../../../shared/components/GxDropzoneButton";
import { useHEImageHandler } from "./useHEImageDropzoneButton";
import { useHEImagesStore } from "../../../../stores/HEImagesStore";

export default function HEImageDropzoneButton() {
  const { getRootProps, getInputProps } = useHEImageHandler();
  const imageName = useHEImagesStore(
    (store) => store.heImageSource?.description
  );

  return (
    <Box>
      <GxDropzoneButton
        getRootProps={getRootProps}
        getInputProps={getInputProps}
        labelTitle="H&E Image File Name"
        labelText={imageName}
        buttonText="H&E Upload image file"
      />
    </Box>
  );
}
