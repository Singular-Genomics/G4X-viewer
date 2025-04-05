import { Box, Button, TextField, Theme, alpha, useTheme } from '@mui/material';
import { GxDropzoneButtonProps } from './GxDropzoneButton.types';

export const GxDropzoneButton = ({
  getRootProps,
  getInputProps,
  labelTitle,
  labelText,
  buttonText,
  disabled = false,
  isDragActive,
  isDragAccept,
  isDragReject,
}: GxDropzoneButtonProps) => {
  const theme = useTheme();
  const sx = styles(theme);

  let dynamicButtonText = buttonText;

  if (isDragActive) {
    if (isDragAccept) {
      dynamicButtonText = "Drop file here";
    } else if (isDragReject) {
      dynamicButtonText = "File type not accepted";
    } else {
      dynamicButtonText = "Drop to upload";
    }
  }

  const buttonStyle = {
    ...sx.dropDownButton,
    ...(isDragActive && sx.dropzoneActive),
    ...(isDragActive && isDragAccept && sx.dropzoneAccept),
    ...(isDragActive && isDragReject && sx.dropzoneReject),
  };

  return (
    <Box>
      <TextField
        variant="filled"
        label={labelTitle}
        size="small"
        fullWidth
        inputProps={{ readOnly: true }}
        value={labelText || ' '}
        sx={sx.textField}
        disabled={disabled}
      />
      <Button
        fullWidth
        variant="outlined"
        sx={buttonStyle}
        size="small"
        disabled={disabled}
        {...getRootProps()}
      >
        <input {...getInputProps()} />
        {dynamicButtonText}
      </Button>
    </Box>
  );
};

const styles = (theme: Theme) => ({
  textField: {
    marginBottom: '8px',
    '& .MuiFormLabel-root.Mui-focused': {
      color: theme.palette.gx.accent.greenBlue
    },
    '& .MuiInputBase-input': {
      cursor: 'auto'
    },
    '& .MuiInputBase-root::after': {
      borderBottom: '2px solid',
      borderColor: theme.palette.gx.accent.greenBlue
    }
  },
  dropDownButton: {
    borderStyle: 'dashed',
    width: '100%',
    height: '40px',
    fontWeight: 700,
    borderColor: theme.palette.gx.accent.greenBlue,
    color: theme.palette.gx.accent.greenBlue,
    '&:hover': {
      borderColor: theme.palette.gx.accent.greenBlue,
      backgroundColor: alpha(theme.palette.gx.accent.greenBlue, 0.2),
    },
    transition: "all 0.15s ease",
  },
  dropzoneActive: {
    borderStyle: "solid",
    borderWidth: "2px",
    backgroundColor: alpha(theme.palette.gx.accent.greenBlue, 0.1),
  },
  dropzoneAccept: {
    borderColor: theme.palette.success.main,
    color: theme.palette.success.main,
    backgroundColor: alpha(theme.palette.success.main, 0.1),
  },
  dropzoneReject: {
    borderColor: theme.palette.error.main,
    color: theme.palette.error.main,
    backgroundColor: alpha(theme.palette.error.main, 0.1),
  },
});
