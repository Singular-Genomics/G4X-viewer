import {
  Select,
  Theme,
  alpha,
  menuItemClasses,
  outlinedInputClasses,
  useTheme,
  MenuItem,
  ListItemText
} from '@mui/material';
import { GxMultiSelectProps } from './GxMultiSelect.types';
import { GxCheckbox } from '../GxCheckbox';

export const GxMultiSelect = ({
  options,
  placeholder = 'Select options...',
  colorVariant = 'light',
  sx: customStyles,
  renderValue,
  value,
  ...rest
}: GxMultiSelectProps) => {
  const theme = useTheme();
  const sx = styles(theme, colorVariant);

  return (
    <Select
      multiple
      displayEmpty
      sx={{ ...sx.rounded, ...customStyles }}
      value={value}
      MenuProps={{
        sx: sx.roundedMenu,
        anchorOrigin: {
          vertical: 'bottom',
          horizontal: 'left'
        },
        transformOrigin: {
          vertical: 'top',
          horizontal: 'left'
        }
      }}
      renderValue={renderValue}
      {...rest}
    >
      {options.map((option) => (
        <MenuItem
          key={option.value}
          value={option.value}
          disableTouchRipple
        >
          {Array.isArray(value) && <GxCheckbox checked={value.includes(option.value)} />}
          <ListItemText>{option.label}</ListItemText>
        </MenuItem>
      ))}
    </Select>
  );
};

const styles = (theme: Theme, variant: 'light' | 'dark') => {
  const isDark = variant === 'dark';

  return {
    rounded: {
      fontSize: '14px',
      borderRadius: '8px',
      background: isDark ? theme.palette.gx.darkGrey[300] : theme.palette.gx.primary.white,
      minHeight: '40px',
      height: 'auto',
      color: isDark ? theme.palette.gx.lightGrey[700] : theme.palette.gx.darkGrey[100],
      width: '100%',
      transition: 'background 0.15s ease, color 0.15s ease',
      '& .MuiPaper-root': {
        filter: 'none'
      },
      '& .MuiSelect-icon': {
        color: isDark ? alpha(theme.palette.gx.lightGrey[100], 0.25) : undefined,
        transition: 'color 0.15s ease'
      },
      '& .MuiSelect-select': {
        padding: '8px 32px 8px 12px !important',
        minHeight: '24px',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '4px',
        boxSizing: 'border-box'
      },
      [`& .${outlinedInputClasses.notchedOutline}`]: {
        border: '1px solid',
        borderColor: isDark
          ? alpha(theme.palette.gx.lightGrey[100], 0.25)
          : alpha(theme.palette.gx.darkGrey[100], 0.25),
        transition: 'border-color 0.15s ease'
      },
      '&.Mui-disabled': {
        opacity: 1,
        border: 'none',
        background: isDark ? theme.palette.gx.darkGrey[500] : theme.palette.gx.lightGrey[500],
        [`& .${outlinedInputClasses.notchedOutline}`]: {
          border: 'none'
        }
      },
      '& .MuiTypography-root': {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      },
      '&:hover': {
        [`& .${outlinedInputClasses.notchedOutline}`]: {
          border: '1px solid',
          borderColor: isDark ? alpha(theme.palette.gx.accent.greenBlue, 0.5) : theme.palette.gx.accent.greenBlue
        }
      },
      [`&.${outlinedInputClasses.focused} .${outlinedInputClasses.notchedOutline}`]: {
        border: '1px solid',
        borderColor: isDark ? alpha(theme.palette.gx.accent.greenBlue, 0.6) : theme.palette.gx.accent.greenBlue
      }
    },
    roundedMenu: {
      '& .MuiPaper-root': {
        border: '1px solid',
        borderColor: isDark
          ? alpha(theme.palette.gx.lightGrey[100], 0.25)
          : alpha(theme.palette.gx.darkGrey[100], 0.25),
        background: isDark ? theme.palette.gx.darkGrey[300] : theme.palette.gx.primary.white,
        filter: 'none',
        fontSize: '14px',
        boxSizing: 'border-box',
        '& .MuiMenu-list': {
          padding: '0'
        },
        '& .MuiMenuItem-root': {
          fontSize: '14px',
          color: isDark ? theme.palette.gx.lightGrey[500] : theme.palette.gx.mediumGrey[100],
          transition: 'background 0.15s ease, color 0.15s ease',
          '&:hover': {
            color: isDark ? alpha(theme.palette.gx.lightGrey[700], 0.9) : theme.palette.gx.accent.greenBlue,
            background: alpha(theme.palette.gx.accent.greenBlue, 0.1)
          },
          [`&.${menuItemClasses.selected}`]: {
            color: theme.palette.gx.accent.greenBlue,
            fontWeight: 500,
            background: alpha(theme.palette.gx.accent.greenBlue, 0.2),
            '&:hover': {
              background: alpha(theme.palette.gx.accent.greenBlue, 0.2)
            }
          }
        }
      }
    }
  };
};
