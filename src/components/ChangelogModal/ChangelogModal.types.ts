import { ChangelogEntry } from '../../config/changelog.types';

export type ChangelogModalProps = {
  isOpen: boolean;
  onClose: () => void;
  entry?: ChangelogEntry;
};
