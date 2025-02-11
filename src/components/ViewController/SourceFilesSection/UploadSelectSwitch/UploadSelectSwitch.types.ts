export type UploadSelectSwitchProps = {
  uploadMode: UploadMode;
  onUploadModeChange: (newMode: UploadMode) => void;
  disabled?: boolean;
};

export type UploadMode = "multi-file" | "single-file" | "dir-upload";
