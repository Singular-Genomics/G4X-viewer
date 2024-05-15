import darkLogo from '../../../assets/img/darkLogo.svg';
import lightLogo from '../../../assets/img/lightLogo.svg';
import { GxLogoProps } from './GxLogo.types';

export const GxLogo = function ({ version = 'dark' }: GxLogoProps) {
  return (
    <img
      src={version === 'light' ? lightLogo : darkLogo}
      alt="logo"
    />
  );
};
