import { GridColDef } from '@mui/x-data-grid';
import { Typography } from '@mui/material';
import { PlotSelectionTableRowEntry } from './PlotSelectionTable.types';

export const usePlotSelectionTableColumns = (): GridColDef<PlotSelectionTableRowEntry>[] => {
  return [
    {
      field: 'name',
      headerName: 'Name',
      headerAlign: 'center',
      filterable: true,
      flex: 1,
      renderCell: (params) => <Typography>{params.row.name}</Typography>
    },
    {
      field: 'type',
      headerName: 'Type',
      headerAlign: 'center',
      filterable: true,
      flex: 0.5,
      renderCell: (params) => <Typography>{params.row.type}</Typography>
    }
  ];
};
