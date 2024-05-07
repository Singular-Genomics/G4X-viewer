import {
  Select,
  SelectProps,
  menuItemClasses,
  outlinedInputClasses,
} from "@mui/material";

export const ScSelect = ({ children, sx: styles, ...rest }: SelectProps) => {
  return (
    <Select sx={{...sx.rounded, ...styles}} MenuProps={{ sx: sx.roundedMenu }} {...rest}>
      {children}
    </Select>
  );
};

const sx = {
  rounded: {
    overflow: 'hidden',
    borderRadius: "8px",
    background: '#FFF',
    height: "40px",
    color: "rgba(18, 18, 18, 0.6)",
    fontSize: "14px",
    "& .MuiPaper-root": {
      filter: "none",
    },
    [`& .${outlinedInputClasses.notchedOutline}`]: {
      border: "1px solid rgba(18, 18, 18, 0.2)",
    },
    "&.Mui-disabled": {
      opacity: 1,
      border: "none ",
      background: "rgba(226, 226, 226, 1)",
      [`& .${outlinedInputClasses.notchedOutline}`]: {
        border: "none ",
      },
    },
    "&:hover": {
      [`& .${outlinedInputClasses.notchedOutline}`]: {
        border: "1px solid rgba(0, 177, 164, 1)",
      },
    },
    [`&.${outlinedInputClasses.focused} .${outlinedInputClasses.notchedOutline}`]:
      {
        border: "1px solid rgba(0, 177, 164, 1)",
      },
  },
  roundedMenu: {
    "& .MuiPaper-root": {
      border: "1px solid rgba(18, 18, 18, 0.2)",
      filter: "none",
      fontSize: "14px",
      boxSizing: "border-box",
      // eslint-disable-next-line max-len
      boxShadow:
        "0px 82px 80px rgba(140, 140, 140, 0.07), 0px 34.2576px 33.4221px rgba(140, 140, 140, 0.0503198), 0px 18.3158px 17.869px rgba(140, 140, 140, 0.0417275), 0px 10.2677px 10.0172px rgba(140, 140, 140, 0.035), 0px 5.45308px 5.32008px rgba(140, 140, 140, 0.0282725), 0px 2.26915px 2.21381px rgba(140, 140, 140, 0.0196802)",
      "& .MuiMenu-list": {
        padding: "0",
      },
      "& .MuiMenuItem-root": {
        fontSize: "14px",
        color: "rgba(121, 121, 121, 1)",
        "&:hover": {
          color: "rgba(121, 121, 121, 1)",
          background: "rgba(1, 167, 168, 0.1)",
        },
        [`&.${menuItemClasses.selected}`]: {
          color: "rgba(4, 167, 168, 1)",
        },
      },
    },
  },
};
