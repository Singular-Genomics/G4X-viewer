import { ReactNode } from 'react';

export type GxGridItemProps = {
  children: ReactNode;
  className?: string;
  title?: string;
  onRemove?: () => void;
  backgroundColor?: string;
};
