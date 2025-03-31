import {
  Select,
  SelectProps,
  Theme,
  alpha,
  menuItemClasses,
  outlinedInputClasses,
  useTheme,
} from "@mui/material";

export const GxSelect = ({
  children,
  sx: customStyles,
  ...rest
}: SelectProps) => {
  const theme = useTheme();
  const sx = styles(theme);

  return (
    <Select
      sx={{ ...sx.rounded, ...customStyles }}
      MenuProps={{ sx: sx.roundedMenu }}
      {...rest}
    >
      {children}
    </Select>
  );
};

const styles = (theme: Theme) => ({
  rounded: {
    overflow: "hidden",
    borderRadius: "8px",
    background: theme.palette.gx.primary.white,
    height: "40px",
    color: theme.palette.gx.darkGrey[100],
    fontSize: "14px",
    "& .MuiPaper-root": {
      filter: "none",
    },
    [`& .${outlinedInputClasses.notchedOutline}`]: {
      border: "1px solid",
      borderColor: alpha(theme.palette.gx.darkGrey[100], 0.2),
    },
    "&.Mui-disabled": {
      opacity: 1,
      border: "none ",
      background: theme.palette.gx.lightGrey[500],
      [`& .${outlinedInputClasses.notchedOutline}`]: {
        border: "none ",
      },
    },
    "& .MuiTypography-root": {
      overflow: "hidden",
    },
    "&:hover": {
      [`& .${outlinedInputClasses.notchedOutline}`]: {
        border: "1px solid",
        borderColor: theme.palette.gx.accent.greenBlue,
      },
    },
    [`&.${outlinedInputClasses.focused} .${outlinedInputClasses.notchedOutline}`]:
      {
        border: "1px solid",
        borderColor: theme.palette.gx.accent.greenBlue,
      },
  },
  roundedMenu: {
    "& .MuiPaper-root": {
      border: "1px solid",
      borderColor: alpha(theme.palette.gx.darkGrey[100], 0.2),
      filter: "none",
      fontSize: "14px",
      boxSizing: "border-box",
      "& .MuiMenu-list": {
        padding: "0",
      },
      "& .MuiMenuItem-root": {
        fontSize: "14px",
        color: theme.palette.gx.mediumGrey[100],
        "&:hover": {
          color: theme.palette.gx.mediumGrey[100],
          background: alpha(theme.palette.gx.accent.greenBlue, 0.1),
        },
        [`&.${menuItemClasses.selected}`]: {
          color: theme.palette.gx.accent.greenBlue,
        },
      },
    },
  },
});
