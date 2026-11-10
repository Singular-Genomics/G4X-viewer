import { Theme } from '@mui/material';
import { getToggleButtonStyles } from './toggleButton.styles';
import { getSliderHandleStyles } from './sliderControls.styles';

export const getAppearanceControlStyles = (theme: Theme) => ({
  toggleButton: { ...getToggleButtonStyles(theme), width: 114 },
  label: {
    fontSize: '0.85rem',
    flexShrink: 0,
    color: theme.palette.text.secondary
  },
  slider: {
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    padding: '0 4px'
  },
  sliderControl: getSliderHandleStyles(theme),

  input: {
    width: 60,
    height: 36,
    flexShrink: 0,
    borderRadius: '6px',
    backgroundColor: theme.palette.background.level2,
    color: theme.palette.text.primary,
    '& .MuiInputBase-input': {
      textAlign: 'center',
      padding: '3px 6px',
      fontSize: '16px'
    },
    '&.Mui-focused': {
      outline: 'none'
      // boxShadow: `inset 0 -2px 0 ${theme.palette.primary.main}`
    }
  }
});
