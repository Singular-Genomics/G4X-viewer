import { Switch, SwitchProps, Theme, alpha, useTheme } from '@mui/material';

export const GxSwitch = (props: SwitchProps) => {
  const theme = useTheme();
  const sx = styles(theme);

  return (
    <Switch
      sx={sx.switch}
      {...props}
    />
  );
};

const styles = (theme: Theme) => ({
  switch: {
    '& .MuiSwitch-switchBase.Mui-checked': {
      color: theme.palette.gx.accent.greenBlue,
      '&:hover': {
        backgroundColor: alpha(theme.palette.gx.accent.greenBlue, 0.3)
      }
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
      backgroundColor: theme.palette.gx.accent.greenBlue
    }
  }
});
