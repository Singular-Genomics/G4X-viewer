import { SelectProps } from '@mui/material';

export type GxMultiSelectOption = {
  value: string;
  label: string;
};

export type GxMultiSelectVariant = 'light' | 'dark';

export type GxMultiSelectProps = Omit<SelectProps<string[]>, 'children' | 'variant'> & {
  options: GxMultiSelectOption[];
  placeholder?: string;
  colorVariant?: GxMultiSelectVariant;
};
