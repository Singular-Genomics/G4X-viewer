import { Slider, SliderProps, Theme, alpha, useTheme } from '@mui/material';

export const GxSlider = ({ sx: customStyles, ...rest }: SliderProps) => {
  const theme = useTheme();
  const sx = styles(theme);

  return (
    <Slider
      sx={{ ...sx.slider, ...customStyles }}
      {...rest}
    />
  );
};

const styles = (theme: Theme) => ({
  slider: {
    marginTop: '13px',
    '&.MuiSlider-root': {
      color: theme.palette.primary.main
    },
    '& .MuiSlider-thumb:hover': {
      boxShadow: `3px 3px 3px 8px ${alpha(theme.palette.gx.neutrals.black, 1)}`
    },
    '&.MuiSlider-root.Mui-disabled': {
      color: theme.palette.action.disabled
    }
  }
});
