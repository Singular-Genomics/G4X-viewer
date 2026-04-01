export type TooltipContentProps = {
  data: TooltipContentItem[];
  title?: string;
};

export type TooltipContentItem = {
  label: string;
  value: string | number;
};
