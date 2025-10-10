import { ReactNode } from 'react';

export type GxDashboardGraphWindowProps = {
  id: string;
  title?: string;
  controlsContent?: ReactNode;
  settingsContent?: ReactNode;
  graphContent: ReactNode;
  backgroundColor?: string;
  removable?: boolean;
  onRemove?: (id: string) => void;
};
