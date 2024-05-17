import { DropzoneRootProps, DropzoneInputProps } from "react-dropzone"

export type DropzoneButtonProps = {
  getRootProps: <T extends DropzoneRootProps>(props?: T | undefined) => T;
  getInputProps: <T extends DropzoneInputProps>(props?: T | undefined) => T;
  labelTitle: string;
  labelText?: string;
  buttonText: string;
  disabled?: boolean;
}