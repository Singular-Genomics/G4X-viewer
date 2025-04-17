import { GetApplyQuickFilterFn, GridColDef } from '@mui/x-data-grid';
import LensIcon from '@mui/icons-material/Lens';
import { Tooltip, Typography } from '@mui/material';
import { PointFiltersTableRowEntry } from './PointFiltersTable.types';

export const usePointFiltersTableColumns = (): GridColDef<PointFiltersTableRowEntry>[] => {
  const geneColorQuickFilter: GetApplyQuickFilterFn<any, unknown> = (value) => {
    if (!(value as string).startsWith('[')) {
      return null;
    }

    const parsedValue = (value as string).replace(/\[|\]/g, '').split(' ').map(Number);
    return (cellValue) => parsedValue.every((value) => (cellValue as Array<number>).includes(value));
  };

  return [
    {
      field: 'gene_name',
      headerName: 'Gene Name',
      headerAlign: 'center',
      filterable: true,
      flex: 1,
      renderCell: (params) => <Typography>{params.row.gene_name}</Typography>
    },
    {
      field: 'color',
      headerAlign: 'center',
      headerName: 'Color',
      filterable: false,
      flex: 1,
      getApplyQuickFilterFn: geneColorQuickFilter,
      renderCell: (params) => (
        <Tooltip title={`RGB: ${params.row.color.join(' ')}`}>
          <LensIcon style={{ color: `rgb(${params.row.color})` }} />
        </Tooltip>
      )
    }
  ];
};
