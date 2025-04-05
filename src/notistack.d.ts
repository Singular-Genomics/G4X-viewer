import { GxSnackbarModes } from './shared/components/GxSnackbar/GxSnackbar.types';

declare module 'notistack' {
  interface VariantOverrides {
    gxSnackbar: {
      customContent?: React.ReactNode;
      titleMode?: GxSnackbarModes;
      iconMode?: GxSnackbarModes;
      customStyles?: {
        titleStyles?: SxProps;
        contentStyles?: SxProps;
      };
    };
  }
}

export {};
