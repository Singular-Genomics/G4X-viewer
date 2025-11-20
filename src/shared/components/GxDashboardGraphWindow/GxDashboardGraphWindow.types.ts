import { ReactNode } from 'react';

export type GxDashboardGraphWindowProps = {
  id: string;
  title?: string;
  controlsContent?: ReactNode;
  settingsContent?: ReactNode;
  graphContent: ReactNode;
  removable?: boolean;
  onRemove?: (id: string) => void;
};
