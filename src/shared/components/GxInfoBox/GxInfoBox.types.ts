export type GxInfoBoxProps = {
  title: string;
  counter?: number | string;
  content: React.ReactNode;
  position: {
    top?: string | number;
    right?: string | number;
    bottom?: string | number;
    left?: string | number;
  };
  defaultExpanded?: boolean;
};
