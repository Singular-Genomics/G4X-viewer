import { Checkbox, CheckboxProps, Theme } from "@mui/material";

export const GxCheckbox = (props: CheckboxProps) => (
  <Checkbox 
    sx={sx.checkbox}
    {...props}
  />
)

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