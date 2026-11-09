import { Box, useTheme } from '@mui/material';
import darkLogo from '../../../assets/img/darkLogo.svg';
import lightLogo from '../../../assets/img/lightLogo.svg';
import { GxLogoProps } from './GxLogo.types';

export const GxLogo = function ({ version, size, color }: GxLogoProps) {
  const theme = useTheme();
  const resolvedVersion = version ?? (theme.palette.mode === 'dark' ? 'light' : 'dark');
  const logo = resolvedVersion === 'light' ? lightLogo : darkLogo;
  if (color)
    return (
      <Box
        component="span"
        role="img"
        aria-label="logo"
        sx={{
          display: 'inline-block',
          flexShrink: 0,
          width: size ?? 48,
          height: size ?? 48,
          backgroundColor: color,
          maskImage: `url("${logo}")`,
          maskMode: 'alpha',
          maskSize: 'contain',
          maskPosition: 'center',
          maskRepeat: 'no-repeat',
          WebkitMaskImage: `url("${logo}")`,
          WebkitMaskSize: 'contain',
          WebkitMaskPosition: 'center',
          WebkitMaskRepeat: 'no-repeat'
        }}
      />
    );
  return (
    <img
      src={logo}
      alt="logo"
      width={size}
    />
  );
};
