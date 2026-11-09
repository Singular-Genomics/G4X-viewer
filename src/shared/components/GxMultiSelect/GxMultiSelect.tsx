import {
  Select,
  Theme,
  alpha,
  menuItemClasses,
  outlinedInputClasses,
  useTheme,
  MenuItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { GxMultiSelectProps } from './GxMultiSelect.types';
import { GxCheckbox } from '../GxCheckbox';
import { t } from 'i18next';

export const GxMultiSelect = ({
  options,
  placeholder = 'Select options...',
  colorVariant = 'light',
  sx: customStyles,
  renderValue,
  value,
  enableSelectAll,
  ...rest
}: GxMultiSelectProps) => {
  const theme = useTheme();
  const sx = styles(theme, colorVariant);
  const isAllSelected = value && options.length > 0 && value.length === options.length;

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
      {enableSelectAll && (
        <MenuItem
          value="all"
          sx={sx.selectedAll}
        >
          <ListItemIcon>
            <GxCheckbox
              checked={isAllSelected}
              indeterminate={value && value.length > 0 && value.length < options.length}
            />
          </ListItemIcon>
          <ListItemText>{t('general.selectAll')}</ListItemText>
        </MenuItem>
      )}
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

const styles = (theme: Theme, _variant: 'light' | 'dark') => {
  return {
    rounded: {
      borderRadius: '8px',
      background: theme.palette.settingsPanel.surface,
      minHeight: '40px',
      height: 'auto',
      color: theme.palette.settingsPanel.text,
      width: '100%',
      transition: 'background 0.15s ease, color 0.15s ease',
      '& .MuiPaper-root': {
        filter: 'none'
      },
      '& .MuiSelect-icon': {
        color: theme.palette.action.active,
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
        borderColor: theme.palette.divider,
        transition: 'border-color 0.15s ease'
      },
      '&.Mui-disabled': {
        opacity: 1,
        border: 'none',
        background: theme.palette.action.disabledBackground,
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
          borderColor: theme.palette.primary.main
        }
      },
      [`&.${outlinedInputClasses.focused} .${outlinedInputClasses.notchedOutline}`]: {
        border: '1px solid',
        borderColor: theme.palette.primary.main
      }
    },
    roundedMenu: {
      '& .MuiPaper-root': {
        border: '1px solid',
        borderColor: theme.palette.divider,
        background: theme.palette.settingsPanel.surface,
        filter: 'none',
        fontSize: '14px',
        boxSizing: 'border-box',
        maxHeight: '500px',
        '& .MuiMenu-list': {
          padding: '0'
        },
        '& .MuiMenuItem-root': {
          fontSize: '14px',
          color: theme.palette.settingsPanel.text,
          transition: 'background 0.15s ease, color 0.15s ease',
          '&:hover': {
            color: theme.palette.settingsPanel.text,
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
    indeterminateColor: {
      color: theme.palette.secondary.main
    },
    selectAllText: {
      fontWeight: 500
    },
    selectedAll: {
      backgroundColor: theme.palette.action.selected,
      '&:hover': {
        backgroundColor: theme.palette.action.selected
      },
      '& .MuiCheckbox-root': {
        '&, &.Mui-checked, &.MuiCheckbox-indeterminate': {
          color: theme.palette.gx.accent.greenBlue
        }
      }
    }
  };
};
