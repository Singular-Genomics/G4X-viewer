import { GridColDef } from '@mui/x-data-grid';
import { Typography } from '@mui/material';
import { PlotSelectionTableRowEntry } from './PlotSelectionTable.types';

export const usePlotSelectionTableColumns = (): GridColDef<PlotSelectionTableRowEntry>[] => {
  return [
    {
      field: 'name',
      headerName: 'Selection',
      headerAlign: 'center',
      filterable: true,
      flex: 1,
      renderCell: (params) => <Typography>{params.row.name}</Typography>
    }
  ];
};
