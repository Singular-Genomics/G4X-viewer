export type GxInfoBoxProps = {
  title: string;
  tag?: number | string;
  content: React.ReactNode;
  position: {
    top?: string | number;
    right?: string | number;
    bottom?: string | number;
    left?: string | number;
  };
  defaultExpanded?: boolean;
};
