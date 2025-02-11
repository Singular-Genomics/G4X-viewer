export type UploadSelectSwitchProps = {
  uploadMode: UploadMode;
  onUploadModeChange: (newMode: UploadMode) => void;
};

export type UploadMode = "multi-file" | "single-file" | "dir-upload";
