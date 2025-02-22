import { GridColDef } from '@mui/x-data-grid';

export type GxFilterTableRowPropBase = {
  id: string;
};

export type GxFilterTableProps<T extends GxFilterTableRowPropBase> = {
  columns: GridColDef<T>[];
  rows: Array<T>;
  activeFilters: string[];
  onClearFilteres: () => void;
  onSetFilter: (newValue: string[]) => void;
};
