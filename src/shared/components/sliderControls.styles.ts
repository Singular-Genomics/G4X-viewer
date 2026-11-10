import { alpha, SxProps, Theme } from '@mui/material';

export const getSliderValueFieldStyles = (theme: Theme): SxProps<Theme> => ({
  position: 'relative',
  width: '48px',
  minWidth: 0,
  flexShrink: 0,
  backgroundColor: theme.palette.background.level1,
  color: theme.palette.text.secondary,
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    width: '10px',
    height: '100%',
    backgroundColor: 'inherit',
    pointerEvents: 'none'
  },
  '&[data-endpoint="min"]': {
    borderRadius: '4px 0 0 4px',
    '& .MuiInputBase-input': {
      textAlign: 'left',
      paddingLeft: '8px'
    },
    '&::after': {
      right: '-10px',
      clipPath: 'polygon(0 0, 100% 50%, 0 100%)'
    }
  },
  '&[data-endpoint="max"]': {
    borderRadius: '0 4px 4px 0',
    '& .MuiInputBase-input': {
      textAlign: 'right',
      paddingRight: '8px'
    },
    '&::after': {
      left: '-10px',
      clipPath: 'polygon(100% 0, 0 50%, 100% 100%)'
    }
  },
  '& .MuiInputBase-input': {
    padding: '3px 4px',
    fontSize: '14px',
    textAlign: 'center'
  },
  '&.Mui-focused': {
    outline: 'none',
    boxShadow: `inset 0 -2px 0 ${theme.palette.primary.main}`
  }
});

export const getSliderHandleStyles = (theme: Theme): SxProps<Theme> => ({
  marginTop: 0,
  '& .MuiSlider-thumb': {
    height: '18px',
    width: '6px',
    borderRadius: '3px'
  },
  '& .MuiSlider-thumb:hover': {
    boxShadow: `0 0 0 4px ${alpha(theme.palette.primary.main, 0.2)}`
  },
  '& .MuiSlider-thumb.Mui-active, & .MuiSlider-thumb.Mui-focusVisible': {
    boxShadow: `0 0 0 6px ${alpha(theme.palette.primary.main, 0.2)}`
  },
  '&.Mui-disabled .MuiSlider-track': {
    border: 'none'
  }
});
