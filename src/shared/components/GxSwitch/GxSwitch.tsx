import { Switch, SwitchProps } from "@mui/material";

export const GxSwitch = (props: SwitchProps) => (
  <Switch sx={sx.switch} {...props}/>
)

const sx = {
  switch: {
    '& .MuiSwitch-switchBase.Mui-checked': {
      color: "rgba(0, 177, 164, 1)",
      '&:hover': {
        backgroundColor: 'rgba(0, 177, 164, 0.3)',
      },
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
      backgroundColor: "rgba(0, 177, 164, 1)",
    },
  }
}