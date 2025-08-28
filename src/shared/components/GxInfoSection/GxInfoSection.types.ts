import { GxInfoBoxProps } from '../GxInfoBox/GxInfoBox.types';

export type GxInfoSectionProps = {
  infoBoxes: GxInfoBoxProps[];
  position: {
    top?: string | number;
    right?: string | number;
    bottom?: string | number;
    left?: string | number;
  };
};
