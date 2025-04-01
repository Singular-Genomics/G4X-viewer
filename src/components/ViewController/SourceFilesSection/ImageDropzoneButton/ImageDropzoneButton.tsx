import { Box, TextField, useTheme, Theme } from "@mui/material";
import { useViewerStore } from "../../../../stores/ViewerStore";
import { GxDropzoneButton } from "../../../../shared/components/GxDropzoneButton";
import { useImageHandler } from "./helpers/useImageHandler";
import { useState } from "react";
import { useSnackbar } from "notistack";
import { useBinaryFilesStore } from "../../../../stores/BinaryFilesStore";
import { useTranscriptLayerStore } from "../../../../stores/TranscriptLayerStore";
import { useCellSegmentationLayerStore } from "../../../../stores/CellSegmentationLayerStore/CellSegmentationLayerStore";
import { useBrightfieldImagesStore } from "../../../../stores/BrightfieldImagesStore";
import { GxModal } from "../../../../shared/components/GxModal";

export default function ImageDropzoneButton() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [cloudImageUrl, setCloudImageUrl] = useState("");

  const handleDropzoneUpload = () => {
    setCloudImageUrl("");
  };

  const { getRootProps, getInputProps } = useImageHandler(handleDropzoneUpload);

  const imageName = useViewerStore((store) => store.source?.description);
  const theme = useTheme();
  const sx = styles(theme);
  const { enqueueSnackbar } = useSnackbar();

  const handleCloudUploadClick = () => {
    setIsPopupOpen(true);
  };

  const handleClose = () => {
    setIsPopupOpen(false);
    setCloudImageUrl("");
  };

  const handleSubmit = () => {
    if (!cloudImageUrl.trim()) {
      enqueueSnackbar({
        message: "Please enter a valid image URL",
        variant: "error",
      });
      return;
    }

    // Extract filename from URL
    const filename = cloudImageUrl.split("/").pop() || cloudImageUrl;

    if (!/^.+\.(ome\.tiff|tif|zarr)$/.test(filename)) {
      enqueueSnackbar({
        message:
          "Invalid input file name. Only .ome.tiff and .zarr extensions allowed",
        variant: "error",
      });
      return;
    }

    const newSource = {
      urlOrFile: cloudImageUrl,
      description: filename,
    };

    useViewerStore.setState({ source: newSource });
    useBinaryFilesStore.getState().reset();
    useTranscriptLayerStore.getState().reset();
    useCellSegmentationLayerStore.getState().reset();
    useBrightfieldImagesStore.getState().reset();

    setIsPopupOpen(false);

    enqueueSnackbar({
      message: `Successfully loaded image from URL: ${filename}`,
      variant: "success",
    });
  };

  return (
    <Box>
      <GxDropzoneButton
        getRootProps={getRootProps}
        getInputProps={getInputProps}
        labelTitle="Image File Name"
        labelText={imageName}
        buttonText="Upload image file"
        onCloudUploadClick={handleCloudUploadClick}
        isCloudUploaded={!!cloudImageUrl}
      />

      <GxModal
        isOpen={isPopupOpen}
        onClose={handleClose}
        onContinue={handleSubmit}
        title="Cloud Upload"
        colorVariant="singular"
        iconVariant="info"
        size="small"
      >
        <Box sx={{ width: "700px" }}>
          <TextField
            variant="filled"
            label="Image URL"
            size="small"
            fullWidth
            value={cloudImageUrl}
            onChange={(e) => setCloudImageUrl(e.target.value)}
            placeholder="Enter URL to .ome.tiff or .zarr file"
            sx={sx.textField}
          />
        </Box>
      </GxModal>
    </Box>
  );
}

const styles = (theme: Theme) => ({
  textField: {
    marginTop: 1,
    marginBottom: "8px",
    "& .MuiFormLabel-root.Mui-focused": {
      color: theme.palette.gx.accent.greenBlue,
    },
    "& .MuiInputBase-input": {
      cursor: "auto",
    },
    "& .MuiInputBase-root::after": {
      borderBottom: "2px solid",
      borderColor: theme.palette.gx.accent.greenBlue,
    },
  },
});
