export type BrightfieldImageSelectorEntryProps = {
  imageEntry: File | string;
  onSelectImage: (selectedImage: File | string) => void;
  onRemoveImage: (fileName: string) => void;
  isActive?: boolean;
};
