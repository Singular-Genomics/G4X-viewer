export type CloudBasedModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
  url: string;
  onUrlChange: (url: string) => void;
  title?: string;
  placeholder?: string;
  label?: string;
};
