import { alpha, Switch, SwitchProps, Theme, useTheme } from '@mui/material';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

type GxLayerToggleProps = {
  checked: boolean;
  disabled?: boolean;
  onChange: NonNullable<SwitchProps['onChange']>;
  label: string;
};

export const GxLayerToggle = ({ checked, disabled, onChange, label }: GxLayerToggleProps) => {
  const theme = useTheme();

  return (
    <Switch
      checked={checked}
      disabled={disabled}
      onChange={onChange}
      disableRipple
      sx={styles(theme)}
      slotProps={{
        input: { role: 'switch', 'aria-label': label },
        track: {
          children: (
            <>
              <CheckRoundedIcon className="layer-toggle-check" />
              <CloseRoundedIcon className="layer-toggle-close" />
            </>
          )
        }
      }}
    />
  );
};

const styles = (theme: Theme) => ({
  width: 46.24,
  height: 24.48,
  padding: 0,
  flexShrink: 0,
  borderRadius: '999px',
  boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.2)}`,
  '& .MuiSwitch-switchBase': {
    padding: '3.6px',
    color: theme.palette.common.white,
    transition: theme.transitions.create('transform', { duration: 90 }),
    '&:hover': {
      backgroundColor: 'transparent'
    },
    '&.Mui-checked': {
      transform: 'translateX(21.76px)',
      color: theme.palette.common.white,
      '& + .MuiSwitch-track': {
        opacity: 1,
        background: `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
        '& .layer-toggle-check': { opacity: 1 },
        '& .layer-toggle-close': { opacity: 0 }
      }
    },
    '&.Mui-focusVisible .MuiSwitch-thumb': {
      outline: `2px solid ${theme.palette.primary.main}`,
      outlineOffset: '2px'
    },
    '&.Mui-disabled': {
      color: theme.palette.common.white,
      opacity: 0.65,
      '& + .MuiSwitch-track': {
        background: theme.palette.action.disabledBackground,
        color: theme.palette.text.disabled,
        opacity: 1
      }
    }
  },
  '& .MuiSwitch-thumb': {
    width: 17.28,
    height: 17.28,
    boxShadow: `0 1px 4px ${alpha(theme.palette.common.black, 0.35)}`
  },
  '& .MuiSwitch-track': {
    position: 'relative',
    borderRadius: '999px',
    opacity: 1,
    color: theme.palette.common.white,
    background: theme.palette.gx.neutrals[25],
    boxShadow: `inset 0 1px 3px ${alpha(theme.palette.common.black, 0.25)}`,
    '& .MuiSvgIcon-root': {
      position: 'absolute',
      top: '5.76px',
      fontSize: '12.96px',
      transition: 'opacity 60ms ease'
    },
    '& .layer-toggle-check': { left: '5.76px', opacity: 0 },
    '& .layer-toggle-close': { right: '5.76px', opacity: 1 }
  },
  '@media (prefers-reduced-motion: reduce)': {
    '& .MuiSwitch-switchBase, & .MuiSvgIcon-root': {
      transition: 'none'
    }
  }
});
