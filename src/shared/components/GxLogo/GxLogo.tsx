import darkLogo from '../../../assets/img/darkLogo.svg';
import lightLogo from '../../../assets/img/lightLogo.svg';
import { GxLogoProps } from './GxLogo.types';

export const GxLogo = function ({ version = 'dark', size }: GxLogoProps) {
  return (
    <img
      src={version === 'light' ? lightLogo : darkLogo}
      alt="logo"
      width={size}
    />
  );
};
