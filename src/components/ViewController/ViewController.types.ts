import { Dispatch, SetStateAction } from 'react';

export type ViewControllerProps = {
  imageLoaded: boolean;
  panelWidth: number;
  onPanelWidthChange: Dispatch<SetStateAction<number>>;
};
