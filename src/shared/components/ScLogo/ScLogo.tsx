import darkLogo from '../../../assets/img/darkLogo.svg';
import lightLogo from '../../../assets/img/lightLogo.svg';
import { ScLogoProps } from './ScLogo.types';

export const ScLogo = function ({ version = 'dark' }: ScLogoProps) {
  return (
    <img
      src={version === 'light' ? lightLogo : darkLogo}
      alt="logo"
    />
  );
};
