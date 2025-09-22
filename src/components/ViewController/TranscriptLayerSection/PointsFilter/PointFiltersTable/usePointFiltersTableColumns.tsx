import { GetApplyQuickFilterFn, GridColDef } from '@mui/x-data-grid';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PointFiltersTableRowEntry } from './PointFiltersTable.types';
import { ColorPickerCell } from './ColorPickerCell';

export const usePointFiltersTableColumns = (): GridColDef<PointFiltersTableRowEntry>[] => {
  const { t } = useTranslation();
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
      headerName: t('transcript.geneName'),
      headerAlign: 'center',
      filterable: true,
      flex: 1,
      renderCell: (params) => <Typography>{params.row.gene_name}</Typography>
    },
    {
      field: 'color',
      headerAlign: 'center',
      headerName: t('transcript.color'),
      filterable: false,
      flex: 1,
      getApplyQuickFilterFn: geneColorQuickFilter,
      renderCell: (params) => <ColorPickerCell row={params.row} />
    }
  ];
};
