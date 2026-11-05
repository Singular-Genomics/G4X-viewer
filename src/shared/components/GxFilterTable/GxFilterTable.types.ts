import { GridColDef } from '@mui/x-data-grid';

export type GxFilterTableRowPropBase = {
  id: string;
};

export type GxFilterTableProps<T extends GxFilterTableRowPropBase> = {
  columns: GridColDef<T>[];
  rows: Array<T>;
  activeFilters: Set<string>;
  onSetFilter: (newValue: Set<string>) => void;
};
