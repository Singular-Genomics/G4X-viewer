import { Switch, SwitchProps, Theme } from '@mui/material';

type GxLayerToggleProps = {
  checked: boolean;
  disabled?: boolean;
  onChange: NonNullable<SwitchProps['onChange']>;
  label: string;
};

export const GxLayerToggle = ({ checked, disabled, onChange, label }: GxLayerToggleProps) => (
  <Switch
    checked={checked}
    disabled={disabled}
    onChange={onChange}
    disableRipple
    sx={sx}
    slotProps={{ input: { role: 'switch', 'aria-label': label } }}
  />
);

const sx = {
  width: 44,
  height: 22,
  padding: 0,
  flexShrink: 0,
  borderRadius: '999px',
  '& .MuiSwitch-switchBase': {
    padding: '4px',
    transition: 'transform 90ms ease',
    '&.Mui-checked': {
      transform: 'translateX(22px)',
      '& + .MuiSwitch-track': {
        backgroundColor: (theme: Theme) => (theme.vars?.palette.layerToggle ?? theme.palette.layerToggle).backgroundOn,
        opacity: 1
      }
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      outline: '2px solid currentColor',
      outlineOffset: '2px'
    },
    '&.Mui-disabled': {
      opacity: 0.5,
      '& + .MuiSwitch-track': { opacity: 0.5 }
    }
  },
  '& .MuiSwitch-thumb': {
    width: 14,
    height: 14,
    backgroundColor: (theme: Theme) => (theme.vars?.palette.layerToggle ?? theme.palette.layerToggle).thumb,
    boxShadow: 'none'
  },
  '& .MuiSwitch-track': {
    borderRadius: '999px',
    backgroundColor: (theme: Theme) => (theme.vars?.palette.layerToggle ?? theme.palette.layerToggle).backgroundOff,
    opacity: 1
  },
  '@media (prefers-reduced-motion: reduce)': {
    '& .MuiSwitch-switchBase': { transition: 'none' }
  }
};
