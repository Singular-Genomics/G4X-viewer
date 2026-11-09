import { Theme } from '@mui/material';

export const getToggleButtonStyles = (theme: Theme) => ({
  width: '100%',
  height: '36px',
  minWidth: 0,
  padding: '6px 16px',
  flexShrink: 0,
  whiteSpace: 'nowrap',
  fontSize: '1rem',
  lineHeight: 1.25,
  // border: '0px solid',
  borderRadius: '6px',
  borderColor: 'transparent',
  color: theme.palette.settingsPanel.toggleButton.text,
  backgroundColor: theme.palette.settingsPanel.toggleButton.background,
  boxShadow: 'none',
  '&.Mui-disabled': {
    borderColor: 'transparent'
  },
  '&.Mui-selected': {
    // borderColor: theme.palette.settingsPanel.toggleButton.activeText,
    color: theme.palette.settingsPanel.toggleButton.activeText,
    backgroundColor: theme.palette.settingsPanel.toggleButton.activeBackground
  },
  '&.Mui-selected:hover': {
    // borderColor: alpha(theme.palette.settingsPanel.toggleButton.activeText, 0.5),
    backgroundColor: theme.palette.settingsPanel.toggleButton.activeHoverBackground
  },
  '&:hover': {
    // borderColor: alpha(theme.palette.settingsPanel.toggleButton.activeText, 0.5),
    backgroundColor: theme.palette.settingsPanel.toggleButton.hoverBackground
  }
});
