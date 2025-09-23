import { ReactNode } from 'react';
import { Layout } from 'react-grid-layout';

export type DashboardGridItem = {
  id: string;
  title?: string;
  content: ReactNode;
  backgroundColor?: string;
  removable?: boolean;
};

export type DashboardGridProps = {
  items: DashboardGridItem[];
  onLayoutChange?: (layout: Layout[]) => void;
  onRemoveItem?: (itemId: string) => void;
  className?: string;
};
