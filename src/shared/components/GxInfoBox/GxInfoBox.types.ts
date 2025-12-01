export type GxInfoBoxProps = {
  title: string;
  tag?: number | string;
  content: React.ReactNode;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
};
