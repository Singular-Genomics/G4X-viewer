import { GridColDef } from '@mui/x-data-grid';
import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PlotSelectionTableRowEntry } from './PlotSelectionTable.types';

export const usePlotSelectionTableColumns = (): GridColDef<PlotSelectionTableRowEntry>[] => {
  const { t } = useTranslation();

  return [
    {
      field: 'name',
      headerName: t('general.gene'),
      headerAlign: 'center',
      filterable: true,
      flex: 1,
      renderCell: (params) => <Typography>{params.row.name}</Typography>
    }
  ];
};
