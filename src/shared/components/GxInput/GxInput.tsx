import { TextField, TextFieldProps, Theme, useTheme } from '@mui/material';

export const GxInput = ({ children, sx: customStyles, ...rest }: TextFieldProps) => {
  const theme = useTheme();
  const sx = styles(theme);

  return (
    <TextField
      sx={{ ...customStyles, ...sx.input }}
      {...rest}
    >
      {children}
    </TextField>
  );
};

const styles = (theme: Theme) => ({
  input: {
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: theme.palette.gx.mediumGrey[100]
      },
      '&:hover fieldset': {
        borderColor: theme.palette.gx.darkGrey[500]
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.gx.accent.greenBlue,
        borderWidth: '1px'
      }
    },
    '& .MuiInput-root': {
      '&::after': {
        borderColor: theme.palette.gx.accent.greenBlue
      }
    },
    '& .MuiFormLabel-root.Mui-focused': {
      color: theme.palette.gx.accent.greenBlue
    }
  }
});
