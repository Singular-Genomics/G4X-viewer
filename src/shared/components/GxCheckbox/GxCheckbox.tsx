import { Checkbox, CheckboxProps, Theme } from "@mui/material";
import React, { ForwardedRef } from "react";

export const GxCheckbox = React.forwardRef((props: CheckboxProps, ref: ForwardedRef<HTMLButtonElement>) => (
  <Checkbox 
    ref={ref}
    sx={sx.checkbox}
    {...props}
  />
))

const sx = {
  checkbox: {
    padding: '8px 8px',
    '&, &.Mui-checked': {
      color: (theme: Theme) => theme.palette.gx.accent.greenBlue,
    },
    '&:hover' : {
      backgroundColor: 'unset',
    }
  }
}