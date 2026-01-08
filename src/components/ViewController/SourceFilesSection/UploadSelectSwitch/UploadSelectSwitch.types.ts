export const UPLOAD_MODES = {
  MULTI_FILE: 'multi-file' as const,
  SINGLE_FILE: 'single-file' as const,
  ZARR_FILE: 'zarr-file' as const
};

export type UploadSelectSwitchProps = {
  uploadMode: UploadMode;
  onUploadModeChange: (newMode: UploadMode) => void;
  disabled?: boolean;
};

export type UploadMode = (typeof UPLOAD_MODES)[keyof typeof UPLOAD_MODES];
