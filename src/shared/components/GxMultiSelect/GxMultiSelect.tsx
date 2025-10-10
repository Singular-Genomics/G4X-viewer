import {
  Select,
  Theme,
  alpha,
  menuItemClasses,
  outlinedInputClasses,
  useTheme,
  Chip,
  Box,
  MenuItem,
  Typography
} from '@mui/material';
import { GxMultiSelectProps } from './GxMultiSelect.types';

export const GxMultiSelect = ({
  options,
  placeholder = 'Select options...',
  colorVariant = 'light',
  sx: customStyles,
  renderValue,
  ...rest
}: GxMultiSelectProps) => {
  const theme = useTheme();
  const sx = styles(theme, colorVariant);

  const defaultRenderValue = (selected: unknown) => {
    const selectedArray = selected as string[];
    if (selectedArray.length === 0) {
      return <Typography sx={sx.placeholder}>{placeholder}</Typography>;
    }
    return (
      <Box sx={sx.chipsContainer}>
        {selectedArray.map((value) => {
          const option = options.find((opt) => opt.value === value);
          return (
            <Chip
              key={value}
              label={option?.label || value}
              size="small"
              sx={sx.chip}
            />
          );
        })}
      </Box>
    );
  };

  return (
    <Select
      multiple
      displayEmpty
      sx={{ ...sx.rounded, ...customStyles }}
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
      renderValue={renderValue || defaultRenderValue}
      {...rest}
    >
      {options.map((option) => (
        <MenuItem
          key={option.value}
          value={option.value}
          disableTouchRipple
        >
          <Typography>{option.label}</Typography>
        </MenuItem>
      ))}
    </Select>
  );
};

const styles = (theme: Theme, variant: 'light' | 'dark') => {
  const isDark = variant === 'dark';

  return {
    rounded: {
      borderRadius: '8px',
      background: isDark ? theme.palette.gx.darkGrey[300] : theme.palette.gx.primary.white,
      minHeight: '40px',
      height: 'auto',
      color: isDark ? theme.palette.gx.lightGrey[700] : theme.palette.gx.darkGrey[100],
      fontSize: '14px',
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
        display: 'flex',
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
    },
    placeholder: {
      color: isDark ? alpha(theme.palette.gx.lightGrey[500], 0.6) : alpha(theme.palette.gx.mediumGrey[100], 0.6),
      fontSize: '14px'
    },
    chipsContainer: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 0.5
    },
    chip: {
      height: '24px',
      fontSize: '12px',
      fontWeight: 500,
      backgroundColor: isDark
        ? alpha(theme.palette.gx.accent.greenBlue, 0.2)
        : alpha(theme.palette.gx.accent.greenBlue, 0.15),
      color: isDark ? theme.palette.gx.accent.greenBlue : alpha(theme.palette.gx.accent.greenBlue, 0.9),
      border: `1px solid ${alpha(theme.palette.gx.accent.greenBlue, 0.4)}`,
      transition: 'background 0.15s ease, color 0.15s ease, border-color 0.15s ease',
      '& .MuiChip-label': {
        px: 1
      }
    }
  };
};
