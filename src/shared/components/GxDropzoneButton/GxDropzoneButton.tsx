import { Box, Button, TextField, Theme, alpha, useTheme } from "@mui/material";
import { GxDropzoneButtonProps } from "./GxDropzoneButton.types";

export const GxDropzoneButton = ({
  getRootProps,
  getInputProps,
  labelTitle,
  labelText,
  buttonText,
  disabled = false,
}: GxDropzoneButtonProps) => {
  const theme = useTheme();
  const sx = styles(theme);

  return (
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
};

const styles = (theme: Theme) => ({
  textField: {
    marginBottom: "8px",
    "& .MuiFormLabel-root.Mui-focused": {
      color: theme.palette.gx.accent.greenBlue,
    },
    "& .MuiInputBase-input": {
      cursor: "auto",
    },
    "& .MuiInputBase-root::after": {
      borderBottom: "2px solid",
      borderColor: theme.palette.gx.accent.greenBlue
    },
  },
  dropDownButton: {
    borderStyle: "dashed",
    width: "100%",
    height: "40px",
    borderColor: theme.palette.gx.accent.greenBlue,
    color: theme.palette.gx.accent.greenBlue,
    "&:hover": {
      borderColor: theme.palette.gx.accent.greenBlue,
      backgroundColor: alpha(theme.palette.gx.accent.greenBlue, 0.2),
    },
  },
});
