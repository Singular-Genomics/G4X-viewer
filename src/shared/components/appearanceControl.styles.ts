import { Theme } from '@mui/material';
import { getToggleButtonStyles } from './toggleButton.styles';
import { getSliderHandleStyles } from './sliderControls.styles';

export const getAppearanceControlStyles = (theme: Theme) => ({
  toggleButton: { ...getToggleButtonStyles(theme), width: 114 },
  label: {
    fontSize: '0.75rem',
    flexShrink: 0
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
    width: 52,
    flexShrink: 0,
    borderRadius: '6px',
    backgroundColor: theme.palette.gx.neutrals[25],
    color: theme.palette.settingsPanel.text,
    '& .MuiInputBase-input': {
      textAlign: 'center',
      padding: '3px 6px',
      fontSize: '14px'
    },
    '&.Mui-focused': {
      outline: 'none'
      // boxShadow: `inset 0 -2px 0 ${theme.palette.primary.main}`
    }
  }
});
