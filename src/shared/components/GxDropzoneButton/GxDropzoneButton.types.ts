import { DropzoneRootProps, DropzoneInputProps } from 'react-dropzone';

export type GxDropzoneButtonProps = {
  getRootProps: <T extends DropzoneRootProps>(props?: T | undefined) => T;
  getInputProps: <T extends DropzoneInputProps>(props?: T | undefined) => T;
  labelTitle: string;
  labelText?: string;
  helperText?: string;
  buttonText: string;
  disabled?: boolean;
  onCloudUploadClick?: () => void;
  isCloudUploaded?: boolean;
  isDragActive?: boolean;
  isDragAccept?: boolean;
  isDragReject?: boolean;
};
