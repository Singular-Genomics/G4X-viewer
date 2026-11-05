import { Select, SelectProps, Theme, alpha, menuItemClasses, outlinedInputClasses, useTheme } from '@mui/material';

export const GxSelect = ({ children, sx: customStyles, MenuProps: customMenuProps, ...rest }: SelectProps) => {
  const theme = useTheme();
  const sx = styles(theme);

  return (
    <Select
      sx={{ ...sx.rounded, ...customStyles }}
      MenuProps={{
        ...customMenuProps,
        sx: {
          ...sx.roundedMenu,
          ...customMenuProps?.sx
        }
      }}
      {...rest}
    >
      {children}
    </Select>
  );
};

const styles = (theme: Theme) => ({
  rounded: {
    overflow: 'hidden',
    borderRadius: '8px',
    background: theme.palette.background.paper,
    height: '40px',
    color: theme.palette.text.primary,
    fontSize: '14px',
    '& .MuiPaper-root': {
      filter: 'none'
    },
    [`& .${outlinedInputClasses.notchedOutline}`]: {
      border: '1px solid',
      borderColor: theme.palette.divider
    },
    '&.Mui-disabled': {
      opacity: 1,
      border: 'none ',
      background: theme.palette.action.disabledBackground,
      [`& .${outlinedInputClasses.notchedOutline}`]: {
        border: 'none '
      }
    },
    '& .MuiTypography-root': {
      overflow: 'hidden'
    },
    '&:hover': {
      [`& .${outlinedInputClasses.notchedOutline}`]: {
        border: '1px solid',
        borderColor: theme.palette.gx.accent.greenBlue
      }
    },
    [`&.${outlinedInputClasses.focused} .${outlinedInputClasses.notchedOutline}`]: {
      border: '1px solid',
      borderColor: theme.palette.gx.accent.greenBlue
    }
  },
  roundedMenu: {
    '& .MuiPaper-root': {
      border: '1px solid',
      borderColor: theme.palette.divider,
      filter: 'none',
      fontSize: '14px',
      boxSizing: 'border-box',
      '& .MuiMenu-list': {
        padding: '0'
      },
      '& .MuiMenuItem-root': {
        fontSize: '14px',
        color: theme.palette.text.secondary,
        '&:hover': {
          color: theme.palette.text.secondary,
          background: alpha(theme.palette.gx.accent.greenBlue, 0.1)
        },
        [`&.${menuItemClasses.selected}`]: {
          color: theme.palette.gx.accent.greenBlue
        }
      }
    }
  }
});
