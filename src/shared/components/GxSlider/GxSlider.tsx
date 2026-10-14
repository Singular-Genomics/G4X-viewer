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
    marginTop: '3px',
    '&.MuiSlider-root': {
      color: theme.palette.gx.accent.greenBlue
    },
    '& .MuiSlider-thumb:hover': {
      boxShadow: `0px 0px 0px 8px ${alpha(theme.palette.gx.accent.greenBlue, 0.3)}`
    },
    '&.MuiSlider-root.Mui-disabled': {
      color: theme.palette.gx.mediumGrey[100]
    }
  }
});
