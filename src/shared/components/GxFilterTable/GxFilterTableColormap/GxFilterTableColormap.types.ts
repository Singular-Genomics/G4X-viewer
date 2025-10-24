import { DropEvent, FileRejection } from 'react-dropzone';

export type GxFilterTableColormapProps = {
  onDrop: <T extends File>(acceptedFiles: T[], fileRejections: FileRejection[], event: DropEvent) => void;
  onExport: () => void;
};
