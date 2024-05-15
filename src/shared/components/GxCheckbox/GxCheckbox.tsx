import { Checkbox, CheckboxProps } from "@mui/material";

export const GxCheckbox = (props: CheckboxProps) => (
  <Checkbox 
    sx={sx.checkbox}
    {...props}
  />
)

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