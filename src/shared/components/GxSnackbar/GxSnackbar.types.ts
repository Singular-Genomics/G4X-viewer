import { SxProps } from '@mui/material';
import { CustomContentProps } from 'notistack';

export type GxSnackbarProps = {
  customContent?: React.ReactNode;
  titleMode?: GxSnackbarModes;
  iconMode?: GxSnackbarModes;
  customStyles?: {
    titleStyles?: SxProps;
    contentStyles?: SxProps;
  };
} & CustomContentProps;

export type GxSnackbarModes = 'brand' | 'success' | 'error' | 'warning' | 'info';
