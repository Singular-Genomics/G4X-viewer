export type BrightfieldImageSelectorEntryProps = {
  imageEntry: File;
  onSelectImage: (selectedImage: File) => void;
  onRemoveImage: (fileName: string) => void;
  isActive?: boolean;
};
