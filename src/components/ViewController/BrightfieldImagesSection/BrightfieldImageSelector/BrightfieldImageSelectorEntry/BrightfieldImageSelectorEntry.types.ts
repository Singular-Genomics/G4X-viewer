export type BrightfieldImageSelectorEntryProps = {
  imageEntry: File | string;
  onSelectImage: (selectedImage: File | string) => void;
  entryType: 'local-file' | 'cloud-upload';
  isActive?: boolean;
};
