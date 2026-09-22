import { ChangelogEntry } from '../../config/changelog.types';

export type ChangelogModalProps = {
  isOpen: boolean;
  onClose: () => void;
  entries?: ChangelogEntry[];
  showMore: boolean;
};

export type ChangelogModalVersionSectionProps = {
  entry: ChangelogEntry;
  openByDefault?: boolean;
};
