export type OmeTiffSelectorEntryProps = {
  imageEntry: File | string;
  onSelectImage: (selectedImage: File | string) => void;
  entryType: 'local-file' | 'cloud-upload';
  isActive?: boolean;
};
