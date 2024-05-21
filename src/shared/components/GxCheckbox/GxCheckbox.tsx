import { Checkbox, CheckboxProps } from "@mui/material";
import React from "react";

export const GxCheckbox = React.forwardRef((props: CheckboxProps) => (
  <Checkbox 
    sx={sx.checkbox}
    {...props}
  />
))

const sx = {
  checkbox: {
    padding: '10px 10px',
    '&, &.Mui-checked': {
      color: "rgba(0, 177, 164, 1)",
    },
    '&:hover' : {
      backgroundColor: 'unset',
    }
  }
}