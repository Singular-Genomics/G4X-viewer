import {
  Box,
  Button,
  TextField,
  Theme,
  alpha,
  useTheme,
  IconButton,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { GxDropzoneButtonProps } from "./GxDropzoneButton.types";

export const GxDropzoneButton = ({
  getRootProps,
  getInputProps,
  labelTitle,
  labelText,
  buttonText,
  disabled = false,
  onCloudUploadClick,
  isCloudUploaded,
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
        InputProps={{
          endAdornment: onCloudUploadClick && (
            <IconButton
              onClick={onCloudUploadClick}
              size="small"
              sx={
                isCloudUploaded ? sx.cloudUploadIconActive : sx.cloudUploadIcon
              }
              disabled={disabled}
            >
              <CloudUploadIcon />
            </IconButton>
          ),
        }}
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
      borderColor: theme.palette.gx.accent.greenBlue,
    },
  },
  dropDownButton: {
    borderStyle: "dashed",
    width: "100%",
    height: "40px",
    fontWeight: 700,
    borderColor: theme.palette.gx.accent.greenBlue,
    color: theme.palette.gx.accent.greenBlue,
    "&:hover": {
      borderColor: theme.palette.gx.accent.greenBlue,
      backgroundColor: alpha(theme.palette.gx.accent.greenBlue, 0.2),
    },
  },
  cloudUploadIcon: {
    color: theme.palette.grey[500],
    "&:hover": {
      backgroundColor: alpha(theme.palette.grey[500], 0.1),
    },
  },
  cloudUploadIconActive: {
    color: theme.palette.gx.accent.greenBlue,
    "&:hover": {
      backgroundColor: alpha(theme.palette.gx.accent.greenBlue, 0.1),
    },
  },
});
