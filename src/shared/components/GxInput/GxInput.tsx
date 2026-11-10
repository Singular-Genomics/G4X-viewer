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
        borderColor: theme.palette.divider
      },
      '&:hover fieldset': {
        borderColor: theme.palette.divider
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.primary.main,
        borderWidth: '1px'
      }
    },
    '& .MuiInput-root': {
      '&::after': {
        borderColor: theme.palette.primary.main
      }
    },
    '& .MuiFormLabel-root.Mui-focused': {
      color: theme.palette.primary.main
    }
  }
});
