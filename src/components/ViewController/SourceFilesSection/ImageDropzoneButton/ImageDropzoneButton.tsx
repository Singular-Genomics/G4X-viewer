import { Button, TextField, Box } from "@mui/material";
import { useDropzone } from "../../../../hooks/useDropzone";
import { useViewerStore } from "../../../../stores/ViewerStore";

export default function ImageDropzoneButton() {
  const { getRootProps, getInputProps } = useDropzone();
  const imageName = useViewerStore(store => store.source?.description);

  return (
    <Box>
      <TextField
        variant="filled"
        label="Image File Name"
        size="small"
        fullWidth
        inputProps={{ readOnly: true}}
        value={imageName || " "}
        sx={sx.textField}
      />
      <Button
        fullWidth
        variant="outlined"
        sx={sx.dropDownButton}
        size="small"
        {...getRootProps()}
      >
        <input {...getInputProps({ accept: ".tif, .tiff" })} />
        Upload image file
      </Button>
    </Box>
  );
}

const sx = {
  textField: {
    marginBottom: '8px',
    '& .MuiFormLabel-root.Mui-focused': {
      color: "rgba(0, 177, 164, 1)",
    },
    '& .MuiInputBase-root::after': {
      borderBottom: '2px solid rgba(0, 177, 164, 1)',
    }
  },
  dropDownButton: {
    borderStyle: "dashed",
    width: "100%",
    height: "40px",
    borderColor: "rgba(0, 177, 164, 1)",
    color: "rgba(0, 177, 164, 1)",
    "&:hover": {
      borderColor: "rgba(0, 177, 164, 1)",
      backgroundColor: "rgba(0, 177, 164, 0.2)",
    },
  },
};
