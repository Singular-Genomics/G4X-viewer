import { Box, Button, TextField } from "@mui/material";
import { DropzoneButtonProps } from "./DropzoneButton.types";

export const DropzoneButton = ({
  getRootProps,
  getInputProps,
  labelTitle,
  labelText,
  buttonText,
  disabled = false,
}: DropzoneButtonProps) => (
  <Box>
    <TextField
      variant="filled"
      label={labelTitle}
      size="small"
      fullWidth
      inputProps={{ readOnly: true }}
      value={labelText || " "}
      sx={sx.textField}
      disabled={disabled}
    />
    <Button
      fullWidth
      variant="outlined"
      sx={sx.dropDownButton}
      size="small"
      disabled={disabled}
      {...getRootProps()}
    >
      <input {...getInputProps()} />
      {buttonText}
    </Button>
  </Box>
);

const sx = {
  textField: {
    marginBottom: '8px',
    '& .MuiFormLabel-root.Mui-focused': {
      color: "rgba(0, 177, 164, 1)",
    },
    '& .MuiInputBase-input': {
      cursor: 'auto',
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
  }
}