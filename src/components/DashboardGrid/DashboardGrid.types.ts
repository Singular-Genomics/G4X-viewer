import { ReactElement } from 'react';
import { Layout } from 'react-grid-layout';
import { GxDashboardGraphWindowProps } from '../../shared/components/GxDashboardGraphWindow';

export type DashboardGridItem = ReactElement<GxDashboardGraphWindowProps>;

export type DashboardGridProps = {
  items: DashboardGridItem[];
  onLayoutChange?: (layout: Layout[]) => void;
  onRemoveItem?: (itemId: string) => void;
};
