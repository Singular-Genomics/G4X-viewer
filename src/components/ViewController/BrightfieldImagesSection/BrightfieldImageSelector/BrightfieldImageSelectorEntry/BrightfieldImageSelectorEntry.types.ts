import type { AvailableImageEntry } from '../../../../../stores/BrightfieldImagesStore/BrightfieldImagesStore.types';

export type BrightfieldImageSelectorEntryProps = {
  imageEntry: AvailableImageEntry;
  onSelectImage: (selectedImage: AvailableImageEntry) => void;
  entryType: 'local-file' | 'cloud-upload';
  isActive?: boolean;
};
