import { useTheme } from '@mui/material';
import darkLogo from '../../../assets/img/darkLogo.svg';
import lightLogo from '../../../assets/img/lightLogo.svg';
import { GxLogoProps } from './GxLogo.types';

export const GxLogo = function ({ version, size }: GxLogoProps) {
  const theme = useTheme();
  const resolvedVersion = version ?? (theme.palette.mode === 'dark' ? 'light' : 'dark');
  return (
    <img
      src={resolvedVersion === 'light' ? lightLogo : darkLogo}
      alt="logo"
      width={size}
    />
  );
};
